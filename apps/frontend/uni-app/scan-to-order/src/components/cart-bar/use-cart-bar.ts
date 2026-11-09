/**
 * 公共购物车底栏的私有交互 Hook：派生徽章、按钮状态并统一保护点击入口。
 * 导出 useCartBar，仅供本组件使用；不读取业务 Store，不请求或跳转。
 * @example const bar = useCartBar(props, { toggleCart, pay, getShop })
 */
import { computed } from 'vue'
import type { CartBarActions, CartBarProps } from './types'

/**
 * 根据响应式属性管理底栏交互，调用方负责异步操作期间更新 checkingOut。
 * @param props 组件响应式属性。
 * @param actions 通过事件通知调用方的操作。
 * @returns 徽章、按钮模式、按钮文案、加载/禁用状态及点击方法。
 * @example const bar = useCartBar(props, actions); bar.activate()
 */
export function useCartBar(props: Readonly<CartBarProps>, actions: CartBarActions) {
  const badge = computed(() => props.number > 0 ? (props.number > 99 ? '99+' : String(props.number)) : '')
  const mode = computed(() => !props.hasShop ? 'select-shop' : props.opened ? 'checkout' : 'closed')
  const loading = computed(() => mode.value === 'checkout' && props.checkingOut)
  const disabled = computed(() => props.checkingOut || mode.value === 'closed' || (mode.value === 'checkout' && props.number <= 0))
  const buttonText = computed(() => mode.value === 'select-shop' ? props.selectShopText : mode.value === 'closed' ? props.closedText : props.checkoutText)

  /** 打开购物车，结算处理中忽略操作。无参数。@returns void。@example openCart() */
  function openCart() {
    if (!props.checkingOut)
      actions.toggleCart()
  }

  /** 按当前状态选择门店或结算，禁用时忽略点击。无参数。@returns void。@example activate() */
  function activate() {
    if (disabled.value)
      return
    if (mode.value === 'select-shop')
      actions.getShop()
    else if (mode.value === 'checkout')
      actions.pay()
  }

  return { badge, mode, loading, disabled, buttonText, openCart, activate }
}
