/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / mock/fixtures/cart.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - createCartFixture：创建新的演示购物车快照，避免不同测试共享对象。
 * - emptyCart：本文件对外声明。
 * 【综合使用示例】
 * import { createCartFixture } from '@/pages/ordering/menu-cart/mock/fixtures/cart'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { CartInfoDto } from '../../api/cart.dto'
import { goods } from '@/pages/ordering/menu/mock'

/**
 * 创建新的演示购物车快照，避免不同测试共享对象。 无参数。
 * @returns CartInfoDto。
 * @example
 * import { createCartFixture } from '@/pages/ordering/menu-cart/mock/fixtures/cart'
 * createCartFixture() // => CartInfoDto
 */
export function createCartFixture(): CartInfoDto {
  const product = goods.find(item => item.id === 101)!
  return { items: [{ key: 'demo-101', goodsId: 101, shopId: 1, categoryId: 1, name: '招牌牛肉饭', pic: product.pic, price: 28, number: 2, minBuyNumber: 1, stores: 50, selected: true, logisticsId: 1 }], number: 2, price: 56, score: 0 }
}
/**
 * emptyCart：供本领域调用的命名能力集合。
 * @returns CartInfoDto；不是独立请求的执行结果。
 * @example
 * import { emptyCart } from '@/pages/ordering/menu-cart/mock/fixtures/cart'
 * emptyCart.items // => 读取对应命名能力或配置
 */
export const emptyCart: CartInfoDto = { items: [], number: 0, price: 0 }
