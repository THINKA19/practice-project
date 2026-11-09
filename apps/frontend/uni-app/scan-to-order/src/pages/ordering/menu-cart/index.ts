/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / index.ts
 * 公开边界：显式导出实际消费者使用的能力。
 * 【方法与导出清单】
 * - cartApi：本文件对外声明。
 * - isCartItemShortage：本文件对外声明。
 * - shouldRemoveOnChange：本文件对外声明。
 * - skuToPropertyChildIds：本文件对外声明。
 * - toOrderGoodsJson：本文件对外声明。
 * - toTableOrderGoodsJson：本文件对外声明。
 * - quickAddNumber：本文件对外声明。
 * - CartItem：数据类型契约。
 * - AddCartCommand：数据类型契约。
 * - useCartStore：本文件对外声明。
 * 【综合使用示例】
 * import { cartApi } from '@/pages/ordering/menu-cart/index'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
export { cartApi } from './api/cart.api'
export { isCartItemShortage } from './domain/cart.rules'
export { shouldRemoveOnChange } from './domain/cart.rules'
export { skuToPropertyChildIds } from './domain/cart.rules'
export { toOrderGoodsJson } from './domain/cart.rules'
export { toTableOrderGoodsJson } from './domain/cart.rules'
export { quickAddNumber } from './domain/cart.rules'
export { describeCartItem } from './domain/cart.rules'
/** 本模块公共入口，仅导出外部使用的能力。 */
export type { CartItem } from './models/types'
export type { AddCartCommand } from './models/types'

export { useCartStore } from './store'
