/**
 * ============================================================================
 * 【文件概述】菜单选品 / mock/fixtures/index.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - normal：本文件对外声明。
 * - empty：本文件对外声明。
 * - error：本文件对外声明。
 * 【综合使用示例】
 * import { normal } from '@/pages/ordering/menu/mock/fixtures/index'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { OrderingPageModel } from '../../models/types'
/**
 * 页面装配样本；接口 Mock 复用所属领域，不重复注册。
 * @returns OrderingPageModel；不是独立请求的执行结果。
 * @example
 * import { normal } from '@/pages/ordering/menu/mock/fixtures/index'
 * normal.shopId // => 读取对应命名能力或配置
 */
export const normal: OrderingPageModel = { shopId: 1, activeCategoryId: 1, loading: false, error: null }
/**
 * empty：供本领域调用的命名能力集合。
 * @returns OrderingPageModel；不是独立请求的执行结果。
 * @example
 * import { empty } from '@/pages/ordering/menu/mock/fixtures/index'
 * empty.shopId // => 读取对应命名能力或配置
 */
export const empty: OrderingPageModel = { ...normal, shopId: null }
/**
 * error：供本领域调用的命名能力集合。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { error } from '@/pages/ordering/menu/mock/fixtures/index'
 * error.message // => 读取对应命名能力或配置
 */
export const error = { message: '演示请求失败，请重试' }
