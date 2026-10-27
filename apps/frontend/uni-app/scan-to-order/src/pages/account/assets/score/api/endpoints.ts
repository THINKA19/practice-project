/** 后端路径清单；网关由接口函数显式选择。 */
export const endpoints = {
  demoLogs: '/__mock/account/score/logs',
  /** 查询积分流水；main 网关。 */
  scoreLogs: '/score/logs',
} as const

/** 本业务仅在开发环境启用演示端点。 */
export function isAssetDemo() {
  return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
}
