/**
 * 商家入驻申请 ViewModel
 * 来源：bee-master/pages/shop/join-apply.js  onLoad、bindSave、afterPicRead、afterPicDel
 * 附件与申请由本模块请求门面提交，复用现有公共 HTTP。
 */
import { useI18n } from 'vue-i18n'
import { joinApplyApi } from './use-requests'
import { ref } from 'vue'
import { useSessionAccountScope } from '@/pages/auth/session'

import type { JoinApplyPic } from '../models/types'

const setTitle = (title: string) => uni.setNavigationBarTitle({ title })

const toast = (title: string, icon: 'none' | 'success' = 'none') => uni.showToast({ title, icon })

const showError = (error: unknown) => toast(error instanceof Error ? error.message : '提交失败')

const back = () => uni.navigateBack()
export { JOIN_APPLY_MAX_PICS } from '../models/enums'

/** 留言类型（与原实现一致） */
const JOIN_APPLY_COMMENT_TYPE = 1

/** 未填写说明时的默认内容 */
const DEFAULT_CONTENT = '申请入驻'

/** 入驻表单与提交锁归页面实例；固定提交快照，换号或销毁时取消后续请求、提示和延时返回。 */
export function useOnboardingPage() {
  const { t } = useI18n()

  const name = ref('')

  const mobile = ref('')

  const content = ref('')

  const picsList = ref<JoinApplyPic[]>([])

  const submitting = ref(false)
  let returnTimer: ReturnType<typeof setTimeout> | undefined
  let loadingOwned = false

  function hideOwnLoading() {
    if (loadingOwned) {
      loadingOwned = false
      uni.hideLoading()
    }
  }
  const scope = useSessionAccountScope(() => {
    clearTimeout(returnTimer)
    returnTimer = undefined
    hideOwnLoading()
    name.value = ''
    mobile.value = ''
    content.value = ''
    picsList.value = []
    submitting.value = false
  })

  function init() {
    setTitle(t('merchantOnboarding.join'))
  }
  /** 逐个上传附件，任一失败就终止申请，保留表单供重试。 */
  async function uploadPics(paths: readonly string[], ticket: number): Promise<Record<string, string>> {
    const ext: Record<string, string> = {}

    for (let index = 0; index < paths.length; index++) {
      if (!scope.current(ticket))
        throw new Error('申请已取消')
      try {
        const res = await joinApplyApi.uploadFile(paths[index])

        ext[`file${index}`] = res.url
      }
      catch (error) {
        throw new Error(`第 ${index + 1} 个附件上传失败，请重试`, { cause: error })
      }
    }
    return ext
  }
  async function bindSave(): Promise<void> {
    const ticket = scope.ticket()
    if (submitting.value || !scope.current(ticket)) {
      return
    }
    if (!name.value.trim()) {
      toast(t('merchantOnboarding.nameRequired'))

      return
    }
    if (!mobile.value.trim()) {
      toast(t('merchantOnboarding.mobileRequired'))

      return
    }
    const draft = {
      name: name.value.trim(),
      mobile: mobile.value.trim(),
      content: content.value.trim() || DEFAULT_CONTENT,
      paths: picsList.value.map(pic => pic.url),
    }
    submitting.value = true
    let succeeded = false
    loadingOwned = true
    uni.showLoading({ title: '提交中' })

    try {
      const ext: Record<string, string> = {
        姓名: draft.name,
        联系电话: draft.mobile,
        ...(await uploadPics(draft.paths, ticket)),
      }
      if (!scope.current(ticket))
        return
      await joinApplyApi.addComment({
        type: JOIN_APPLY_COMMENT_TYPE,
        extJsonStr: JSON.stringify(ext),
        content: draft.content,
      })
      if (!scope.current(ticket))
        return

      toast(t('common.submitSuccess'), 'success')
      succeeded = true
      returnTimer = setTimeout(() => {
        if (scope.current(ticket))
          back()
      }, 1000)
    }
    catch (e) {
      if (scope.current(ticket))
        showError(e)
    }
    finally {
      if (scope.current(ticket)) {
        hideOwnLoading()
        if (!succeeded)
          submitting.value = false
      }
    }
  }
  return { name, mobile, content, picsList, submitting, init, bindSave }
}
