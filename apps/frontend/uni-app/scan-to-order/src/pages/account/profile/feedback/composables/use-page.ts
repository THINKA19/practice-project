import { ClientRoutes } from '@/pages/routes'
/** 反馈表单：提交时上传，失败保留输入。 */
import { onScopeDispose, reactive, ref, watch } from 'vue'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { submitFeedback } from './use-actions'
import { back, chooseImage, showError, toast } from '@/utils/project/interaction'

export const FEEDBACK_MAX_PICS = 6
/** 维护反馈表单与附件选择；提交固定输入快照，换号或销毁后不提示旧结果或延时返回。 */
export function useFeedbackPage() {
  const session = useSessionState()

  const form = reactive({ name: '', mobile: '', content: '' })

  const picsList = ref<string[]>([])
  const videoUrls = ref<string[]>([])

  const submitting = ref(false)

  let generation = 0

  let disposed = false

  let timer: ReturnType<typeof setTimeout> | undefined

  watch(() => session.sessionRevision, () => {
    generation++

    Object.assign(form, { name: '', mobile: '', content: '' })

    picsList.value = []
    videoUrls.value = []

    submitting.value = false

    clearTimeout(timer)
  }, { flush: 'sync' })

  onScopeDispose(() => {
    disposed = true

    generation++

    clearTimeout(timer)
  })

  async function choosePics() {
    if (submitting.value || picsList.value.length >= FEEDBACK_MAX_PICS)
      return

    const ticket = generation

    try {
      const paths = await chooseImage(FEEDBACK_MAX_PICS - picsList.value.length)

      if (!disposed && ticket === generation)
        picsList.value = [...picsList.value, ...paths].slice(0, FEEDBACK_MAX_PICS)
    }
    catch { /* 取消不改变表单。 */ }
  }

  function removePic(index: number) {
    if (!submitting.value) {
      videoUrls.value = videoUrls.value.filter(url => url !== picsList.value[index])
      picsList.value.splice(index, 1)
    }
  }

  async function chooseVideo() {
    if (submitting.value || picsList.value.length >= FEEDBACK_MAX_PICS)
      return
    const ticket = generation
    try {
      const result = await new Promise<UniApp.ChooseVideoSuccess>((resolve, reject) => uni.chooseVideo({ success: resolve, fail: reject }))
      if (disposed || ticket !== generation || picsList.value.length >= FEEDBACK_MAX_PICS)
        return
      picsList.value.push(result.tempFilePath)
      videoUrls.value.push(result.tempFilePath)
    }
    catch { /* 取消选择不改变表单。 */ }
  }

  function previewPic(url: string) {
    uni.previewImage({ urls: picsList.value.filter(path => !videoUrls.value.includes(path)), current: url })
  }

  async function bindSave() {
    if (submitting.value)
      return

    if (!form.name.trim())
      return toast('请填写姓名')

    if (!form.content.trim())
      return toast('请填写反馈内容')

    if (form.mobile.trim() && !/^1\d{10}$/.test(form.mobile.trim()))
      return toast('请填写正确的手机号')

    if (!requireIdentity('customer'))
      return

    const ticket = generation

    submitting.value = true
    let succeeded = false

    try {
      await submitFeedback({ name: form.name.trim(), mobile: form.mobile.trim(), content: form.content.trim(), files: [...picsList.value] })

      if (disposed || ticket !== generation)
        return

      toast('提交成功', 'success')
      succeeded = true

      timer = setTimeout(() => {
        if (!disposed && ticket === generation)
          back(ClientRoutes.Account.my)
      }, 1000)
    }
    catch (error) {
      if (!disposed && ticket === generation)
        showError(error)
    }
    finally {
      if (!disposed && ticket === generation && !succeeded)
        submitting.value = false
    }
  }

  return { form, demo: import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true', picsList, videoUrls, submitting, choosePics, chooseVideo, previewPic, removePic, bindSave }
}
