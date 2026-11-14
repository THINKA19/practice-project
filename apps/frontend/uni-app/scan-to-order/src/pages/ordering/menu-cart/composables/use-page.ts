/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / composables/use-page.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - useCartPage：本文件对外声明。
 * 【综合使用示例】
 * import { useCartPage } from '@/pages/ordering/menu-cart/composables/use-page'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { needsLogin, redirect, useOrderingLocale as useI18n } from '@/pages/ordering/menu'
/**
 * 扫码点餐购物车 ViewModel
 * 来源：bee-master/pages/cart/index.js shippingCarInfo / cartStepChange / clearCart / goCreateOrder
 */
import type { CartItem } from '../models/types'
import { shouldRemoveOnChange, toTableOrderGoodsJson } from '../domain/cart.rules'
import { useCartStore } from '../store'
import { useShopCheckoutAvailability, useShopStore } from '@/pages/ordering/index'
import { requireIdentity } from '@/pages/auth/session'
import { orderApi } from '@/pages/account/profile/order'
import { setTitle, showError } from '@/utils/project/interaction'
import { usePageLoading } from '@/hooks/project/usePageLoading'

import { ClientRoutes } from '@/pages/routes'

/**
 * 创建购物车页面流程，通过共享 Store 执行数量更新和清空。 无参数。
 * @returns 对象，包含 t、cart、init、loadCart、changeNumber、clearCart、goCreateOrder。
 * @example
 * import { useCartPage } from '@/pages/ordering/menu-cart/composables/use-page'
 * useCartPage() // => 对象，包含 t、cart、init、loadCart、changeNumber、clearCart、goCreateOrder
 */
export function useCartPage() {
  const { t } = useI18n()

  const { loading, withLoading } = usePageLoading()
  const cartStore = useCartStore()
  const availability = useShopCheckoutAvailability()
  /** 购物车（null 表示空） */

  const cart = computed(() => (cartStore.info && cartStore.info.items?.length ? cartStore.info : null))

  const submitting = ref(false)

  /** 统一错误处理：未登录则重登后刷新 */

  async function handleError(e: unknown) {
    showError(e)
    if (needsLogin(e))
      requireIdentity('customer')
  }

  /** 拉取购物车（失败视为空，与原实现一致） */

  async function loadCart() {
    if (!requireIdentity('customer')) {
      cartStore.resetLocal()
      return
    }
    await withLoading(() => cartStore.refresh())
  }

  function init() {
    setTitle(t('cart.title'))
  }

  /** 步进器修改数量：低于起购数量删除商品 */

  async function changeNumber(item: CartItem, value: number) {
    try {
      if (shouldRemoveOnChange(item, value)) {
        await withLoading(() => cartStore.changeNumber(item.key, 0))
      }
      else {
        await withLoading(() => cartStore.changeNumber(item.key, value))
      }
    }
    catch (e) {
      handleError(e)

      return
    }
  }

  /** 清空购物车，返回是否成功 */

  async function clearCart(): Promise<boolean> {
    try {
      await withLoading(() => cartStore.clear())
    }
    catch (e) {
      handleError(e)

      return false
    }

    return true
  }

  /** 桌台下单：提交到桌台订单 → 清空购物车 → 已点菜品页 */

  async function goCreateOrder() {
    if (submitting.value || !cart.value) {
      return
    }

    const shop = useShopStore()
    const table = shop.scanDining
    if (!table || Number(table.shopId) !== shop.current?.id || !requireIdentity('customer')) {
      showError(new Error('请重新扫描当前门店桌码后下单'))
      return
    }
    if (cart.value.items.some(item => Number(item.shopId) !== Number(table.shopId))) {
      showError(new Error('购物车包含其他门店商品，请重新选餐'))
      return
    }
    submitting.value = true

    try {
      await availability.ensureAvailable(Number(table.shopId))
      if (shop.scanDining !== table)
        throw new Error('桌台已变更，请重新扫码后下单')
      const goods = toTableOrderGoodsJson(cart.value.items)

      await withLoading(() => orderApi.cyTableAddOrder({ goodsJsonStr: JSON.stringify(goods), shopId: table.shopId, tableId: table.id, key: table.key }))
    }
    catch (e) {
      submitting.value = false

      handleError(e)

      return
    }

    await clearCart()

    submitting.value = false

    redirect(ClientRoutes.Ordering.cartOrder)
  }

  return { t, cart, loading, init, loadCart, changeNumber, clearCart, goCreateOrder, submitting, checkoutReason: availability.reason }
}
