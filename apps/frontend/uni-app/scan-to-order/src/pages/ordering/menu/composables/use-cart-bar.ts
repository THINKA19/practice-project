/**
 * ============================================================================
 * 【文件概述】菜单选品 / composables/use-cart-bar.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - AddCartResult：数据类型契约。
 * - CartBarOptions：数据类型契约。
 * - useOrderingCartBar：本文件对外声明。
 * 【综合使用示例】
 * import type { AddCartResult } from '@/pages/ordering/menu/composables/use-cart-bar'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
import { useOrderingLocale } from './use-locale'
import { needsLogin } from '../adapters/errors.adapter'
import type { AddCartCommand, CartItem } from '@/pages/ordering/menu-cart'
import type { Goods } from '../models/goods.types'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { quickAddNumber, useCartStore } from '@/pages/ordering/menu-cart'
import { computeBadges } from '../domain/catalog.rules'
import { confirm, showError } from '@/utils/project/interaction'
import { navigate as go } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'
import { useShopCheckoutAvailability } from '@/pages/ordering/index'
/**
 * 点餐页 - 购物车条 / 购物车弹层 ViewModel
 * 来源：bee-master/pages/index/index.js shippingCarInfo/showCartPop/hideCartPop/addCart1/
 *       cartStepChange/clearCart/goPay/processBadge
 * 值约束：'ok' | 'needLogin' | 'failed'。
 * @example
 * import type { AddCartResult } from '@/pages/ordering/menu/composables/use-cart-bar'
 * declare const response: AddCartResult
 * const value: AddCartResult = response // => 保留 AddCartResult 的字段与取值约束
 */

export type AddCartResult = 'ok' | 'needLogin' | 'failed'

/**
 * CartBarOptions 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：isScanMode、onNeedLogin；必填与可选字段见声明。
 * @example
 * import type { CartBarOptions } from '@/pages/ordering/menu/composables/use-cart-bar'
 * declare const response: CartBarOptions
 * const value: CartBarOptions = response // => 保留 CartBarOptions 的字段与取值约束
 */
export interface CartBarOptions {
  /** 是否扫码点餐模式（扫码模式购物车/结算都去购物车页） */
  isScanMode: () => boolean
  /** 接口返回未登录时触发 */
  onNeedLogin: () => void
}

/**
 * 创建 use-cart-bar 对应的领域状态与交互能力。
 * @param options {CartBarOptions} 调用配置及依赖能力。
 * @returns 对象，包含 info、items、totalNumber、totalPrice、showPopup、badges、refresh、toggleCart、hideCart、addItem、quickAdd、changeNumber、clear、goPay。
 * @example
 * import { useOrderingCartBar } from '@/pages/ordering/menu/composables/use-cart-bar'
 * declare const options: Parameters<typeof useOrderingCartBar>[0]
 * useOrderingCartBar(options) // => 对象，包含 info、items、totalNumber、totalPrice、showPopup、badges、refresh、toggleCart、hideCart、addItem、quickAdd、changeNumber、clear、goPay
 */
export function useOrderingCartBar(options: CartBarOptions) {
  const cartStore = useCartStore()
  const availability = useShopCheckoutAvailability()
  const addingGoods = ref<Record<string, boolean>>({})
  const { t } = useOrderingLocale()
  const changingItems = ref<Record<string, boolean>>({})
  const clearing = ref(false)
  const editingCart = ref(false)
  const confirmingClear = ref(false)
  const checkingOut = ref(false)
  let mutationFailures = 0
  let finishWaiting: ((ready: boolean) => void) | undefined
  const updating = computed(() => Object.keys(changingItems.value).length > 0 || Object.keys(addingGoods.value).length > 0)
  const mutating = computed(() => clearing.value || updating.value)
  watch(() => updating.value, (busy) => {
    if (!busy)
      finishWaiting?.(true)
  })
  onScopeDispose(() => finishWaiting?.(false))
  const clearBlocked = computed(() => confirmingClear.value || checkingOut.value || clearing.value)
  const pendingAdds = new Map<string, Promise<AddCartResult>>()

  const info = computed(() => cartStore.info)

  const items = computed(() => cartStore.items)

  const totalNumber = computed(() => cartStore.totalNumber)

  const totalPrice = computed(() => cartStore.totalPrice)

  const showPopup = ref(false)

  /** 购物车数量 → 分类/商品徽章 */

  const badges = computed(() => computeBadges(cartStore.items))

  // 购物车为空或获取失败时收起弹层（原 shippingCarInfo / cartStepChange 的 700 分支）

  watch(info, (v) => {
    if (!v || !v.items?.length) {
      showPopup.value = false
    }
  })

  function refresh() {
    return cartStore.refresh()
  }

  function toggleCart() {
    if (options.isScanMode()) {
      go(ClientRoutes.Ordering.cart)

      return
    }

    if (!totalNumber.value)
      return
    showPopup.value = !showPopup.value
  }

  function hideCart() {
    showPopup.value = false
  }

  /** 加购只显示按钮内加载；同一商品请求未完成时合并重复点击。 */

  function addItem(cmd: AddCartCommand): Promise<AddCartResult> {
    if (editingCart.value || checkingOut.value || clearing.value || confirmingClear.value)
      return Promise.resolve('failed')
    const key = String(cmd.goodsId)
    const existing = pendingAdds.get(key)
    if (existing)
      return existing
    addingGoods.value = { ...addingGoods.value, [key]: true }
    const task = (async (): Promise<AddCartResult> => {
      try {
        await cartStore.add(cmd)
        return 'ok'
      }
      catch (e) {
        mutationFailures++
        if (needsLogin(e)) {
          options.onNeedLogin()
          return 'needLogin'
        }
        showError(e)
        return 'failed'
      }
    })().finally(() => {
      const next = { ...addingGoods.value }
      delete next[key]
      addingGoods.value = next
      pendingAdds.delete(key)
    })
    pendingAdds.set(key, task)
    return task
  }

  async function updateItem(item: CartItem, cmd: AddCartCommand): Promise<AddCartResult> {
    if (mutating.value || checkingOut.value || confirmingClear.value)
      return 'failed'
    editingCart.value = true
    changingItems.value = { ...changingItems.value, [item.key]: true }
    try {
      await cartStore.replaceItem(item, cmd)
      return 'ok'
    }
    catch (error) {
      mutationFailures++
      showError(error)
      return 'failed'
    }
    finally {
      const next = { ...changingItems.value }
      delete next[item.key]
      changingItems.value = next
      editingCart.value = false
    }
  }

  /** 列表“+”快速加购：已在购物车 +1，否则按起购数量 */

  async function quickAdd(goods: Goods) {
    return addItem({
      goodsId: goods.id,
      number: quickAddNumber(cartStore.info, goods.id, goods.minBuyNumber),
      sku: [],
    })
  }

  /** 购物车步进器：数量 < 1 删除 */

  async function changeNumber(item: CartItem, number: number) {
    if (editingCart.value || checkingOut.value || clearing.value || confirmingClear.value || changingItems.value[item.key] || number === item.number)
      return
    changingItems.value = { ...changingItems.value, [item.key]: true }
    try {
      await cartStore.changeNumber(item.key, number)
    }
    catch (e) {
      mutationFailures++
      showError(e)
    }
    finally {
      const next = { ...changingItems.value }
      delete next[item.key]
      changingItems.value = next
    }
  }

  /** 清空前确认；请求失败保留现有购物车。 */
  async function clear() {
    if (clearBlocked.value || !items.value.length)
      return
    confirmingClear.value = true
    try {
      const accepted = await confirm({
        title: t('cart.clear'),
        content: t('cart.clearConfirm'),
        confirmText: t('cart.clearAction'),
        cancelText: t('cart.cancel'),
      })
      if (!accepted)
        return
      clearing.value = true
      if (updating.value) {
        const ready = await new Promise<boolean>((resolve) => {
          finishWaiting = resolve
        })
        if (!ready)
          return
      }
      if (items.value.length)
        await cartStore.clear()
    }
    catch (e) {
      mutationFailures++
      showError(e)
    }
    finally {
      finishWaiting = undefined
      clearing.value = false
      confirmingClear.value = false
    }
  }

  /** 去结算：扫码点餐去购物车页，否则去结算页 */

  async function goPay() {
    if (checkingOut.value || clearing.value || confirmingClear.value || !totalNumber.value)
      return
    checkingOut.value = true
    const failures = mutationFailures
    try {
      if (mutating.value) {
        const ready = await new Promise<boolean>((resolve) => {
          finishWaiting = resolve
        })
        if (!ready || mutationFailures !== failures)
          return
      }
      await availability.ensureAvailable()
      if (totalNumber.value)
        go(options.isScanMode() ? ClientRoutes.Ordering.cart : ClientRoutes.Ordering.pay)
    }
    catch (e) {
      showError(e)
    }
    finally {
      finishWaiting = undefined
      checkingOut.value = false
    }
  }

  return {
    info,
    checkoutReason: availability.reason,
    checkingOut,
    changingItems,
    clearing,
    confirmingClear,
    clearBlocked,
    mutating,
    editingCart,
    addingGoods,
    items,
    totalNumber,
    totalPrice,
    showPopup,
    badges,
    refresh,
    toggleCart,
    hideCart,
    addItem,
    updateItem,
    quickAdd,
    changeNumber,
    clear,
    goPay,
  }
}
