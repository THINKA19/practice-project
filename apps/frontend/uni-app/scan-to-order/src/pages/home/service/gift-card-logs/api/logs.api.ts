/**
 * ============================================================================
 * 【文件概述】礼品卡流水请求层，只调用现有公共客户端；关闭缓存并在调用时读取客户凭证。
 * 【方法与导出清单】cardLogsApi：流水请求对象。
 * 【综合使用示例】
 * import { cardLogsApi } from './logs.api'
 * const page = await cardLogsApi.logs({ cardId: 7, page: 1, pageSize: 20 }) // => 服务端分页
 * ============================================================================
 */
import type { CardLogsInput, CardLogsPage } from '../models/types'
import { http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import { endpoints } from './endpoints'

export const cardLogsApi = {
/**
 * 查询持卡流水，不在请求层修改分页或转换模型。
 * @param data CardLogsInput；持卡编号与分页条件。
 * @returns Promise<CardLogsPage | null>；空响应交编排层归一化，失败拒绝。
 * @example await cardLogsApi.logs({ cardId: 7, page: 1, pageSize: 20 }) // => 服务端分页结果
 */
  logs(data: CardLogsInput) {
    return http.Post<CardLogsPage | null>(endpoints.logs, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
}
