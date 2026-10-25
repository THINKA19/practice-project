/**
 * 系统/内容上下文 - 应用服务
 */
import type { FeedbackForm } from '../../index/models/feedback'
import { buildFeedbackExt, FEEDBACK_COMMENT_TYPE } from '../../index/models/feedback'
import { mediaApi } from '@/shared/media'
import { feedbackApi } from '../../index/api/feedback'

/**
 * 提交意见反馈（原 pages/my/feedback bindSave）
 * 附件逐个上传，单个失败时跳过（与原实现一致），全部完成后 addComment(type=1)
 */
export async function submitFeedback(form: FeedbackForm) {
  const fileUrls: string[] = []
  for (const path of form.files) {
    try {
      const res = await mediaApi.uploadFile(path)
      fileUrls.push(res.url)
    }
    catch {
      fileUrls.push('')
    }
  }
  return feedbackApi.addComment({
    type: FEEDBACK_COMMENT_TYPE,
    extJsonStr: JSON.stringify(buildFeedbackExt(form.name, form.mobile, fileUrls)),
    content: form.content,
  })
}
