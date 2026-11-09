/**
 * ============================================================================
 * 【文件概述】商品详情 / api/kanjia.dto.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - KanjiaSetDto：数据类型契约。
 * - KanjiaInfoDto：数据类型契约。
 * 【综合使用示例】
 * import type { KanjiaSetDto } from '@/pages/ordering/menu-goods-details/api/kanjia.dto'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/* ---------------- 砍价 ---------------- */
/**
 * KanjiaSetDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、goodsId、minPrice；必填与可选字段见声明。
 * @example
 * import type { KanjiaSetDto } from '@/pages/ordering/menu-goods-details/api/kanjia.dto'
 * declare const response: KanjiaSetDto
 * const value: KanjiaSetDto = response // => 保留 KanjiaSetDto 的字段与取值约束
 */
export interface KanjiaSetDto {
  id: number
  goodsId: number
  minPrice: number
  [k: string]: unknown
}

/**
 * KanjiaInfoDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：kanjiaInfo、joiner、helps；必填与可选字段见声明。
 * @example
 * import type { KanjiaInfoDto } from '@/pages/ordering/menu-goods-details/api/kanjia.dto'
 * declare const response: KanjiaInfoDto
 * const value: KanjiaInfoDto = response // => 保留 KanjiaInfoDto 的字段与取值约束
 */
export interface KanjiaInfoDto {
  kanjiaInfo: { curPrice: number, helpNumber: number, uid: number, [k: string]: unknown }
  joiner?: Record<string, unknown>
  helps?: unknown[]
  [k: string]: unknown
}
