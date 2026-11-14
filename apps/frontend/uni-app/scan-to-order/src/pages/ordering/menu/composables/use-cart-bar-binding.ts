/**
 * 点餐业务的公共底栏接入 Hook：复用页面已有购物车和门店实例，统一组装属性及事件。
 * 导出 useOrderingCartBarBinding；不创建第二份购物车，不接管异步结算。
 * @example const cartBar = useOrderingCartBarBinding(cart, shop)
 */
import { computed } from 'vue'
import type { CartBarActions, CartBarProps } from '@/components/cart-bar'
import { useOrderingLocale } from './use-locale'
import type { useOrderingCartBar } from './use-cart-bar'
import type { useOrderingShopSection } from './use-shop-section'

/**
 * 将点餐上下文适配为公共底栏契约；币种、语言和金额随已有状态响应式更新。
 * @param cart 页面已创建的购物车业务实例。
 * @param shop 页面已创建的门店业务实例。
 * @returns props、listeners 和显隐状态，供模板直接绑定。
 * @example const bar = useOrderingCartBarBinding(cart, shop) // v-bind="bar.props.value"
 */
export function useOrderingCartBarBinding(
  cart: Pick<ReturnType<typeof useOrderingCartBar>, 'totalNumber' | 'totalPrice' | 'checkingOut' | 'toggleCart' | 'goPay' | 'checkoutReason'>,
  shop: Pick<ReturnType<typeof useOrderingShopSection>, 'shop' | 'isOpened' | 'loadShop'>,
) {
  const { t } = useOrderingLocale()
  const props = computed<CartBarProps>(() => ({
    number: cart.totalNumber.value,
    price: cart.totalPrice.value,
    checkingOut: cart.checkingOut.value,
    opened: !cart.checkoutReason.value,
    hasShop: !!shop.shop.value,
    countryCode: shop.shop.value?.countryCode,
    cartText: t('cart.title'),
    checkoutText: t('index.submit'),
    selectShopText: t('index.selectShop'),
    closedText: '暂不可结算',
  }))
  const visible = computed(() => !!shop.shop.value && cart.totalNumber.value > 0)
  const listeners: CartBarActions = {
    toggleCart: cart.toggleCart,
    pay: cart.goPay,
    getShop: () => { void shop.loadShop() },
  }
  return { props, listeners, visible }
}
