/** 后端路径清单；网关由接口函数显式选择。 */
export const endpoints = {
  /** 提交签到；main 网关。 */
  sign: '/score/sign',
  /** 查询签到记录；main 网关。 */
  signLogs: '/score/sign/logs',
} as const
