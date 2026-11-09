/**
 * ============================================================================
 * 【文件概述】菜单选品 / api/content.api.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - orderingContentApi：本文件对外声明。
 * 【综合使用示例】
 * import { orderingContentApi } from '@/pages/ordering/menu/api/content.api'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { http } from '@/http/alova'
import { endpoints } from './endpoints'
/**
 * 点餐公告原始请求；单条和多条返回的转换由消费流程调用模型函数完成。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { orderingContentApi } from '@/pages/ordering/menu/api/content.api'
 * orderingContentApi.notices // => 读取对应命名能力或配置
 */

export const orderingContentApi = {
  /**
   * 查询无需顾客登录的原始公告响应；无参数。
   * @returns Promise<unknown>，原始单条/列表；失败沿用请求客户端错误。
   * @example const raw = await orderingContentApi.notices() // => 原始公告响应，需经 normalizeNotices 转换
   */
  notices: () => http.Get<unknown>(endpoints.notice, { cacheFor: 0, meta: { ignoreAuth: true } }).send(),
}
