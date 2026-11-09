/**
 * ============================================================================
 * 【文件概述】菜单选品 / models/types.ts
 * 模型层：维护数据契约、展示转换和派生数据，不拥有页面状态。
 * 【方法与导出清单】
 * - OptionChoiceView：数据类型契约。
 * - OptionGroupView：数据类型契约。
 * - IndexPageQuery：数据类型契约。
 * - OrderingPageModel：数据类型契约。
 * - OrderingNotice：数据类型契约。
 * 【综合使用示例】
 * import type { OptionChoiceView } from '@/pages/ordering/menu/models/types'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/**
 * 点餐页表现层共享类型（ViewModel 与页面私有组件之间的展示模型）
 */

/**
 * 规格 / 加料 / 时段 共用的选项组展示模型
 * 结构字段：id、name、active；必填与可选字段见声明。
 * @example
 * import type { OptionChoiceView } from '@/pages/ordering/menu/models/types'
 * declare const response: OptionChoiceView
 * const value: OptionChoiceView = response // => 保留 OptionChoiceView 的字段与取值约束
 */
export interface OptionChoiceView {
  priceText?: string
  id: number
  name: string
  active: boolean
}

/**
 * OptionGroupView 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、name、choices；必填与可选字段见声明。
 * @example
 * import type { OptionGroupView } from '@/pages/ordering/menu/models/types'
 * declare const response: OptionGroupView
 * const value: OptionGroupView = response // => 保留 OptionGroupView 的字段与取值约束
 */
export interface OptionGroupView {
  id: number
  name: string
  choices: OptionChoiceView[]
}

/**
 * 点餐页 onLoad 参数
 * 结构字段：scene、share_goods_id、share_pingtuan_open_id、inviter_id；必填与可选字段见声明。
 * @example
 * import type { IndexPageQuery } from '@/pages/ordering/menu/models/types'
 * declare const response: IndexPageQuery
 * const value: IndexPageQuery = response // => 保留 IndexPageQuery 的字段与取值约束
 */
export interface IndexPageQuery {
  /** 扫码点餐小程序码 scene */
  scene?: string
  /** 分享进入：商品 id */
  share_goods_id?: string
  /** 分享进入：拼团 id */
  share_pingtuan_open_id?: string
  inviter_id?: string
}

/**
 * 点餐菜单编排；依赖 goods、shop、cart。
 * 结构字段：shopId、activeCategoryId、loading、error；必填与可选字段见声明。
 * @example
 * import type { OrderingPageModel } from '@/pages/ordering/menu/models/types'
 * declare const response: OrderingPageModel
 * const value: OrderingPageModel = response // => 保留 OrderingPageModel 的字段与取值约束
 */
export interface OrderingPageModel { shopId: number | null, activeCategoryId: number | null, loading: boolean, error: string | null }

/** 首页公告展示契约。@example const notice: OrderingNotice = { id: 1, title: '欢迎点餐', content: '现点现做' } */
export interface OrderingNotice { id: number, title: string, content: string, publishedAt?: string }
