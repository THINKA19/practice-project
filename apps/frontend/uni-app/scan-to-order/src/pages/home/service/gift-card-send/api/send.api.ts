/**
 * ============================================================================
 * 【文件概述】礼品卡赠送请求层，只调用现有公共客户端；关闭缓存并在调用时读取客户凭证。
 * 【方法与导出清单】cardSendApi：赠送请求对象。
 * 【综合使用示例】
 * import { cardSendApi } from './send.api'
 * const token = await cardSendApi.openShare({ id: 7, remark: '祝好' }) // => 服务端原始凭证
 * ============================================================================
 */
import type { CardCancelInput, CardSendInput } from '../models/types'
import { http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import { endpoints } from './endpoints'

export const cardSendApi = {
/**
 * 请求签发分享凭证，不在 API 层解释响应。
 * @param data CardSendInput；持卡编号和留言。
 * @returns Promise<unknown>；原始凭证需由模型层校验，失败拒绝。
 * @example await cardSendApi.openShare({ id: 7, remark: '祝好' }) // => 服务端原始凭证
 */
  openShare(data: CardSendInput) {
    return http.Post<unknown>(endpoints.shareOpen, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  /**
   * 撤回本人卡片的赠送，不自动重放写操作。
   * @param data CardCancelInput；持卡编号。
   * @returns Promise<unknown>；成功后调用方刷新卡包，失败拒绝。
   * @example await cardSendApi.shareClose({ id: 7 }) // => 服务端成功后凭证失效
   */
  shareClose(data: CardCancelInput) {
    return http.Post<unknown>(endpoints.shareClose, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
}
