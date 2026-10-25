/** 后端路径清单；网关由接口函数显式选择。 */
export const endpoints = {
  /** 查询排队类型；main 网关。 */
  types: '/queuing/types',
  demo: '/demo/queue/snapshot',
  demoAction: '/demo/queue/action',
  /** 领取排队号码；main 网关。 */
  take: '/queuing/get',
  cancel: '/queuing/cancel',
  /** 查询当前用户记录；main 网关。 */
  my: '/queuing/my',
} as const
