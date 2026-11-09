/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / mock/fixtures/order.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - normal：本文件对外声明。
 * - empty：本文件对外声明。
 * 【综合使用示例】
 * import { normal } from '@/pages/ordering/menu-cart/mock/fixtures/order'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { TableOrderPageModel } from '../../models/types'

/**
 * normal：供本领域调用的命名能力集合。
 * @returns TableOrderPageModel；不是独立请求的执行结果。
 * @example
 * import { normal } from '@/pages/ordering/menu-cart/mock/fixtures/order'
 * normal.tableId // => 读取对应命名能力或配置
 */
export const normal: TableOrderPageModel = { tableId: 'demo-table-1', orderIds: [1001], loading: false }
/**
 * empty：供本领域调用的命名能力集合。
 * @returns TableOrderPageModel；不是独立请求的执行结果。
 * @example
 * import { empty } from '@/pages/ordering/menu-cart/mock/fixtures/order'
 * empty.tableId // => 读取对应命名能力或配置
 */
export const empty: TableOrderPageModel = { tableId: 'demo-table-1', orderIds: [], loading: false }
