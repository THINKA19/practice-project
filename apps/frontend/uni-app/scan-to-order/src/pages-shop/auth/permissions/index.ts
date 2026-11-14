/** 商家请求上下文：门店授权、当前门店、请求身份快照与页面访问校验。商家分包各领域只依赖这里，不互相依赖。 */
export { acceptStaffInvite } from './composables/use-invite-actions'
export { useMerchantPage } from './composables/use-page'
export { useMerchantShopStore } from './composables/use-shop-store'
export { merchantClock, merchantCurrency } from './models/market'
export { MERCHANT_PAGE_PERMISSIONS } from './models/enums'
export { isStaffPermission } from './models/policy'
export type { MerchantShop, ShopRequestContext } from './models/types'

export type MerchantPageAccess = ReturnType<typeof import('./composables/use-page').useMerchantPage>
