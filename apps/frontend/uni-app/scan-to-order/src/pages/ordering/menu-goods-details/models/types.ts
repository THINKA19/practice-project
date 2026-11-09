/**
 * ============================================================================
 * 【文件概述】商品详情 / models/types.ts
 * 模型层：维护数据契约、展示转换和派生数据，不拥有页面状态。
 * 【方法与导出清单】
 * - GoodsDetailQuery：数据类型契约。
 * - GoodsDetailPageModel：数据类型契约。
 * 【综合使用示例】
 * import type { GoodsDetailQuery } from '@/pages/ordering/menu-goods-details/models/types'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/**
 * GoodsDetailQuery 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、scene、inviter_id、kjJoinUid；必填与可选字段见声明。
 * @example
 * import type { GoodsDetailQuery } from '@/pages/ordering/menu-goods-details/models/types'
 * declare const response: GoodsDetailQuery
 * const value: GoodsDetailQuery = response // => 保留 GoodsDetailQuery 的字段与取值约束
 */
export interface GoodsDetailQuery {
  id?: string
  scene?: string
  inviter_id?: string
  kjJoinUid?: string
}

/**
 * 商品详情、规格和数量；商品数据由 goods 提供。
 * 结构字段：goodsId、quantity、loading、error；必填与可选字段见声明。
 * @example
 * import type { GoodsDetailPageModel } from '@/pages/ordering/menu-goods-details/models/types'
 * declare const response: GoodsDetailPageModel
 * const value: GoodsDetailPageModel = response // => 保留 GoodsDetailPageModel 的字段与取值约束
 */
export interface GoodsDetailPageModel { goodsId: string, quantity: number, loading: boolean, error: string | null }
