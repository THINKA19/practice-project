/**
 * 意见反馈 ViewModel
 * 来源：bee-master/pages/my/feedback.js
 */
import { useI18n } from 'vue-i18n'
import { reloginIfNeeded } from '@/shared/session'
import { submitFeedback } from './submit'
import { setTitle } from '@/shared/platform/device'
import { showError, toast, withLoading } from '@/shared/platform/feedback'
import { back } from '@/shared/platform/navigation'

/** 附件（与上传组件 file-list 结构兼容，url 为本地临时路径） */
export interface FeedbackPic {
  url: string
  [k: string]: unknown
}

export const FEEDBACK_MAX_PICS = 6

export function usePage() {
  const { t } = useI18n()

  const name = ref('')
  const mobile = ref('')
  const content = ref('')
  const picsList = ref<FeedbackPic[]>([])
  const submitting = ref(false)

  function init() {
    setTitle(t('feedback.title'))
  }

  async function bindSave(retried = false): Promise<void> {
    if (submitting.value) {
      return
    }
    if (!name.value) {
      toast(t('feedback.nameRequired'))
      return
    }
    if (!content.value) {
      toast(t('feedback.contentRequired'))
      return
    }
    submitting.value = true
    try {
      await withLoading(() => submitFeedback({
        name: name.value,
        mobile: mobile.value,
        content: content.value,
        files: picsList.value.map(p => p.url),
      }))
      toast(t('common.submitSuccess'), 'success')
      setTimeout(() => back(), 1000)
    }
    catch (e) {
      if (!retried && await reloginIfNeeded(e)) {
        submitting.value = false
        return bindSave(true)
      }
      showError(e)
    }
    finally {
      submitting.value = false
    }
  }

  return { name, mobile, content, picsList, submitting, init, bindSave }
}
