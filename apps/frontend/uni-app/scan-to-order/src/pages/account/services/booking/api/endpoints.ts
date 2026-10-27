/** 后端路径清单；网关由接口函数显式选择。 */
export const endpoints = {
  /** 提交预约报名；common 网关。 */
  join: '/yuyue/join',
  info: '/yuyue/info',
} as const
