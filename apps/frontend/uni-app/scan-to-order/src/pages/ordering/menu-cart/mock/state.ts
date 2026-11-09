/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / mock/state.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - createCartState：创建按演示身份和购物车类型隔离的模拟服务端状态。
 * - cartState：本文件对外声明。
 * 【综合使用示例】
 * import { createCartState } from '@/pages/ordering/menu-cart/mock/state'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { CartInfoDto, CartItemDto } from '../api/cart.dto'
import { createCartFixture } from './fixtures/cart'
/**
 * 每个身份和购物车类型单独保存；所有返回值是快照。
 * @returns 对象，包含 snapshot、save、reset。
 * @example
 * import { createCartState } from '@/pages/ordering/menu-cart/mock/state'
 * createCartState() // => 对象，包含 snapshot、save、reset
 */
export function createCartState() {
  const carts = new Map<string, CartInfoDto>()

  function current(owner: string, type: string) {
    const key = JSON.stringify([owner, type])

    if (!carts.has(key))
      carts.set(key, createCartFixture())

    return carts.get(key)!
  }

  function snapshot(owner: string, type = '') {
    return structuredClone(current(owner, type))
  }

  function save(owner: string, type: string, items: CartItemDto[]) {
    carts.set(JSON.stringify([owner, type]), { items: structuredClone(items), number: items.reduce((n, i) => n + i.number, 0), price: items.reduce((n, i) => n + Math.round(i.price * 100) * i.number, 0) / 100 })

    return snapshot(owner, type)
  }

  return { snapshot, save, reset: () => carts.clear() }
}
/**
 * cartState：供本领域调用的数据声明。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { cartState } from '@/pages/ordering/menu-cart/mock/state'
 * cartState // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const cartState = createCartState()
