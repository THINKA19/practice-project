/** 优惠券业务入口；福利中心复用领券状态与组件。 */
export { default as CouponCard } from './components/CouponCard/index.vue'
export { default as CouponPwdDialog } from './components/CouponPwdDialog/index.vue'
export { useCouponPage } from './composables/use-page'
export { couponApi } from './composables/use-requests'
export { couponDateOnly, couponFetchErrorKey, couponUseTarget } from './domain/coupons.rules'
export type { CouponStatistics } from './models/types'
