/** 后端路径清单；网关由接口函数显式选择。 */
export const endpoints = {
  demoAmount: '/__mock/account/wallet/amount',
  demoRules: '/__mock/account/wallet/rules',
  demoRecharge: '/__mock/account/wallet/recharge',
  /** 查询用户资产；main 网关。 */
  amount: '/user/amount',
  /** 查询充值赠送规则；main 网关。 */
  rechargeRules: '/user/recharge/send/rule',
} as const
/** 仅选择开发端点，不改变公共请求实例。 */
export function isAssetDemo() {
  return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
}
