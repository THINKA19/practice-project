/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / mock/fixtures/pages.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - select：本文件对外声明。
 * - detail：本文件对外声明。
 * 【综合使用示例】
 * import { select } from '@/pages/ordering/index/mock/fixtures/pages'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { ShopDetailPageModel, ShopSelectPageModel } from '../../models/types'

/**
 * select：供本领域调用的命名能力集合。
 * @returns ShopSelectPageModel；不是独立请求的执行结果。
 * @example
 * import { select } from '@/pages/ordering/index/mock/fixtures/pages'
 * select.keyword // => 读取对应命名能力或配置
 */
export const select: ShopSelectPageModel = { keyword: '', selectedShopId: 1 }
/**
 * detail：供本领域调用的命名能力集合。
 * @returns ShopDetailPageModel；不是独立请求的执行结果。
 * @example
 * import { detail } from '@/pages/ordering/index/mock/fixtures/pages'
 * detail.shopId // => 读取对应命名能力或配置
 */
export const detail: ShopDetailPageModel = { shopId: 1, loading: false }
