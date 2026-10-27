/** 后端路径清单；网关由接口函数显式选择。 */
export const endpoints = {
  /** 查询列表；main 网关。 */
  list: '/card/list',
  /** 查询当前用户记录；main 网关。 */
  my: '/card/my',
  /** 查询使用流水；main 网关。 */
  logs: '/card/logs',
  /** 兑换券或卡；main 网关。 */
  exchange: '/card/exchange',
  /** 开启礼品卡赠送；main 网关。 */
  shareOpen: '/card/share/open',
  /** 撤回礼品卡赠送；main 网关。 */
  shareClose: '/card/share/close',
  /** 预览或领取赠送卡；main 网关。 */
  shareFetch: '/card/share/fetch',
} as const
