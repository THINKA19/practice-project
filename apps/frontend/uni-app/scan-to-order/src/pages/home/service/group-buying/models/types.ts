/**
 * ============================================================================
 * 【文件概述】service/group-buying/models/types.ts，负责业务模型与边界转换。
 * 【方法与导出清单】GroupBuying、GroupBuyingPage
 * 【综合使用示例】
 * import type { GroupBuying } from '@/pages/home/service/group-buying/models/types'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
/** 团购展示模型，价格单位为元，endsAt 为毫秒时间戳。 */
export interface GroupBuying {
  id: number
  name: string
  description: string
  price: number
  originalPrice: number
  people: number
  joined: number
  endsAt: number
  image: string
  participating: boolean
}
/** 团购分页结果。 */
export interface GroupBuyingPage { list: GroupBuying[], total: number }
