/** 真实微信接口为前端契约，需服务端配置微信应用后实现。 */
export const endpoints = {
  start: '/auth/wechat/start',
  status: '/auth/wechat/status',
  exchange: '/auth/wechat/exchange',
  demoStart: '/demo/auth/wechat/start',
  demoStatus: '/demo/auth/wechat/status',
  demoConfirm: '/demo/auth/wechat/confirm',
  demoExchange: '/demo/auth/wechat/exchange',
} as const
