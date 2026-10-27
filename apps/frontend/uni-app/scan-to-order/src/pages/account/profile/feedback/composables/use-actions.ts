import type { FeedbackForm } from '../models/types'
import { feedbackApi } from './use-requests'
import { uploadAttachment } from '@/pages/account/index/index'
import { getSessionRevision } from '@/pages/auth/session'
/** 所有附件上传成功后才提交，失败保留表单，避免静默丢失举证。 */
export async function submitFeedback(form: FeedbackForm) {
  const revision = getSessionRevision()
  const files: string[] = []
  for (const path of form.files) {
    if (revision !== getSessionRevision())
      throw new Error('账户已切换，请重新提交')
    files.push(await uploadAttachment(path))
  }
  if (revision !== getSessionRevision())
    throw new Error('账户已切换，请重新提交')
  return feedbackApi.submit({ ...form, files })
}
