/** 公共购物车底栏的展示契约，由调用方提供数据、文案和营业状态。@example const props: CartBarProps = { ...cartBarData } */
export interface CartBarProps {
  cartText: string
  checkoutText: string
  selectShopText: string
  closedText: string
  countryCode?: string
  checkingOut: boolean
  number: number
  price: number
  opened: boolean
  hasShop: boolean
}

/** 底栏交互事件契约，由调用方执行业务操作。@example const actions: CartBarActions = { toggleCart, pay, getShop } */
export interface CartBarActions {
  toggleCart: () => void
  pay: () => void
  getShop: () => void
}
