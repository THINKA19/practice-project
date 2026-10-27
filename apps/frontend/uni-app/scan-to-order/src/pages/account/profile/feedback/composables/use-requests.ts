import { feedbackRequests } from '../api/feedback.api'
import type { FeedbackForm } from '../models/types'
import { buildFeedbackExt } from '../domain/feedback.rules'
import { FEEDBACK_COMMENT_TYPE } from '../models/enums'

/** 反馈提交门面：构建留言类型和附件扩展字段，交给本模块 API 发送。 */
export const feedbackApi = {
  async submit(form: FeedbackForm) {
    return feedbackRequests.submit({
      type: FEEDBACK_COMMENT_TYPE,
      content: form.content,
      extJsonStr: JSON.stringify(buildFeedbackExt(form.name, form.mobile, form.files)),
    })
  },
}
