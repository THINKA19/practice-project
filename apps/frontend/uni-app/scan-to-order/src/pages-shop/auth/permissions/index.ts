/** 商家请求上下文：门店授权、当前门店、请求身份快照与页面访问校验。商家分包各领域只依赖这里，不互相依赖。 */
export { acceptStaffInvite } from './composables/use-invite-actions'
export { useMerchantPage } from './composables/use-page'
export { useMerchantShopStore } from './composables/use-shop-store'
export type { MerchantShop, ShopRequestContext } from './models/types'
