/**
 * 商家入驻申请 ViewModel
 * 来源：bee-master/pages/shop/join-apply.js  onLoad、bindSave、afterPicRead、afterPicDel
 * 附件使用公共 media 能力；入驻留言由本模块接口提交（addComment type=1）
 */
import { useI18n } from 'vue-i18n'
import { joinApplyApi } from '../api/joinApply'
import { ref } from 'vue'

const setTitle = (title: string) => uni.setNavigationBarTitle({ title })

const toast = (title: string, icon: 'none' | 'success' = 'none') => uni.showToast({ title, icon })

const showError = (error: unknown) => toast(error instanceof Error ? error.message : '提交失败')

async function withLoading(action: () => Promise<void>) {
  uni.showLoading({ title: '提交中' })
  try {
    await action()
  }
  finally {
    uni.hideLoading()
  }
}
const back = () => uni.navigateBack()

/** 附件（与 wd-upload file-list 结构兼容，url 为本地临时路径） */
export interface JoinApplyPic {
  url: string
  [k: string]: unknown
}
export const JOIN_APPLY_MAX_PICS = 9

/** 留言类型（与原实现一致） */
const JOIN_APPLY_COMMENT_TYPE = 1

/** 未填写说明时的默认内容 */
const DEFAULT_CONTENT = '申请入驻'

export function useJoinApplyPage() {
  const { t } = useI18n()

  const name = ref('')

  const mobile = ref('')

  const content = ref('')

  const picsList = ref<JoinApplyPic[]>([])

  const submitting = ref(false)

  function init() {
    setTitle(t('shop.join'))
  }
  /** 逐个上传附件，任一失败就终止申请，保留表单供重试。 */
  async function uploadPics(): Promise<Record<string, string>> {
    const ext: Record<string, string> = {}

    for (let index = 0; index < picsList.value.length; index++) {
      try {
        const res = await joinApplyApi.uploadFile(picsList.value[index].url)

        ext[`file${index}`] = res.url
      }
      catch (error) {
        throw new Error(`第 ${index + 1} 个附件上传失败，请重试`, { cause: error })
      }
    }
    return ext
  }
  async function bindSave(): Promise<void> {
    if (submitting.value) {
      return
    }
    if (!name.value) {
      toast(t('shop.nameRequired'))

      return
    }
    if (!mobile.value) {
      toast(t('shop.mobileRequired'))

      return
    }
    if (!content.value) {
      content.value = DEFAULT_CONTENT
    }
    submitting.value = true

    try {
      await withLoading(async () => {
        const ext: Record<string, string> = {
          姓名: name.value,
          联系电话: mobile.value,
          ...(await uploadPics()),
        }

        await joinApplyApi.addComment({
          type: JOIN_APPLY_COMMENT_TYPE,
          extJsonStr: JSON.stringify(ext),
          content: content.value,
        })
      })

      toast(t('common.submitSuccess'), 'success')

      setTimeout(() => back(), 1000)
    }
    catch (e) {
      showError(e)
    }
    finally {
      submitting.value = false
    }
  }
  return { name, mobile, content, picsList, submitting, init, bindSave }
}
