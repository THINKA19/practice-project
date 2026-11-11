/** 后端路径清单；网关由接口函数显式选择。 */
export const endpoints = {
  demoTemplates: '/__mock/home/coupons/templates',
  demoDetail: '/__mock/home/coupons/detail',
  demoMy: '/__mock/home/coupons/my',
  demoStatistics: '/__mock/home/coupons/statistics',
  demoFetch: '/__mock/home/coupons/fetch',
  demoExchange: '/__mock/home/coupons/exchange',
  /** 查询可领取优惠券；main 网关。 */
  templates: '/discounts/coupons',
  /** 查询详情；main 网关。 */
  detail: '/discounts/detail',
  /** 领取优惠券；main 网关。 */
  fetch: '/discounts/fetch',
  /** 查询当前用户记录；main 网关。 */
  my: '/discounts/my',
  /** 兑换券或卡；main 网关。 */
  exchange: '/discounts/exchange',
  /** 查询优惠券统计；main 网关。 */
  statistics: '/discounts/statistics',
} as const

/** 本业务仅在开发环境启用演示端点。 */
export function isAssetDemo() {
  return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
}
