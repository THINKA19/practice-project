/** 商家请求上下文：门店授权、当前门店、请求身份快照与页面访问校验。商家分包各领域只依赖这里，不互相依赖。 */
export { acceptStaffInvite } from './api/invite'
export { useMerchantPage } from './composables/useMerchantPage'
export type { MerchantShop, ShopRequestContext } from './models/context'
export { useMerchantShopStore } from './store'
