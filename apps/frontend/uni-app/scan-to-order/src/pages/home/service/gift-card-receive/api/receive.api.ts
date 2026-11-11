/**
 * ============================================================================
 * 【文件概述】礼品卡领取请求层，只调用现有公共客户端；关闭缓存并在调用时读取客户凭证。
 * 【方法与导出清单】cardReceiveApi：领取请求对象。
 * 【综合使用示例】
 * import { cardReceiveApi } from './receive.api'
 * const preview = await cardReceiveApi.fetchShare({ id: 7, shareToken: 'example', calculate: true }) // => 原始预览
 * ============================================================================
 */
import type { CardReceiveInput } from '../models/types'
import { http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import { endpoints } from './endpoints'

export const cardReceiveApi = {
/**
 * 预览或领取赠送，原样保留 calculate 标识，不重试写入。
 * @param data CardReceiveInput；持卡编号、凭证和操作标识。
 * @returns Promise<unknown>；预览由模型层校验，领取仅依据请求成功判断。
 * @example await cardReceiveApi.fetchShare({ id: 7, shareToken: 'example', calculate: true }) // => 原始预览响应
 */
  fetchShare(data: CardReceiveInput) {
    return http.Post<unknown>(endpoints.shareFetch, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
}
