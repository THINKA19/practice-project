/** 后端路径清单；网关由接口函数显式选择。 */
export const endpoints = {
  demoLevels: '/__mock/home/membership/levels',
  /** 查询会员等级；common 网关。 */
  levels: '/user/level/list',
} as const
