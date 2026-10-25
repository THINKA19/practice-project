import { endpoints } from './endpoints'

import { http } from '@/infrastructure/http'

export const feedbackApi = {

  /**
   * 留言/反馈（意见反馈、门店入驻申请都走此接口）
   * type: 0 意见反馈 等，具体见后台配置；extJsonStr 为扩展字段 JSON
   */
  addComment(data: Record<string, string | number | undefined>) {
    return http.post<unknown>(endpoints.addComment, data, { gateway: 'common' })
  },
}
