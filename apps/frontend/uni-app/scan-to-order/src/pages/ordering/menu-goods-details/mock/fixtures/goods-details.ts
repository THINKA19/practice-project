/**
 * ============================================================================
 * 【文件概述】商品详情 / mock/fixtures/goods-details.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - normal：本文件对外声明。
 * - empty：本文件对外声明。
 * - error：本文件对外声明。
 * 【综合使用示例】
 * import { normal } from '@/pages/ordering/menu-goods-details/mock/fixtures/goods-details'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { GoodsDetailPageModel } from '../../models/types'
/**
 * 页面装配样本；接口 Mock 复用所属领域，不重复注册。
 * @returns GoodsDetailPageModel；不是独立请求的执行结果。
 * @example
 * import { normal } from '@/pages/ordering/menu-goods-details/mock/fixtures/goods-details'
 * normal.goodsId // => 读取对应命名能力或配置
 */
export const normal: GoodsDetailPageModel = { goodsId: '102', quantity: 1, loading: false, error: null }
/**
 * empty：供本领域调用的命名能力集合。
 * @returns GoodsDetailPageModel；不是独立请求的执行结果。
 * @example
 * import { empty } from '@/pages/ordering/menu-goods-details/mock/fixtures/goods-details'
 * empty.goodsId // => 读取对应命名能力或配置
 */
export const empty: GoodsDetailPageModel = { ...normal, goodsId: '', quantity: 0 }
/**
 * error：供本领域调用的命名能力集合。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { error } from '@/pages/ordering/menu-goods-details/mock/fixtures/goods-details'
 * error.message // => 读取对应命名能力或配置
 */
export const error = { message: '演示请求失败，请重试' }
