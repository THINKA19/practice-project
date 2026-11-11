/**
 * ============================================================================
 * 【文件概述】礼品卡兑换请求层，只调用现有公共客户端；关闭缓存并在调用时读取客户凭证。
 * 【方法与导出清单】cardExchangeApi：兑换请求对象。
 * 【综合使用示例】
 * import { cardExchangeApi } from './exchange.api'
 * await cardExchangeApi.exchange({ number: 'GIFT-DEMO' }) // => Mock 首次兑换成功
 * ============================================================================
 */
import type { CardExchangeInput } from '../models/types'
import { http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import { endpoints } from './endpoints'

export const cardExchangeApi = {
/**
 * 提交兑换，不重试、不弹窗；兑换资格由服务端判断。
 * @param data CardExchangeInput；已清理空白的兑换码。
 * @returns Promise<unknown>；成功载荷不参与页面判断，失败拒绝。
 * @example await cardExchangeApi.exchange({ number: 'GIFT-DEMO' }) // => Mock 首次兑换成功
 */
  exchange(data: CardExchangeInput) {
    return http.Post<unknown>(endpoints.exchange, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
}
