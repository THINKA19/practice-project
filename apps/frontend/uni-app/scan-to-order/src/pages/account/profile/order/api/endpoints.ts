/** 后端路径清单；网关由接口函数显式选择。 */
export const endpoints = {
  /** 仅开发 Mock 使用，不属于后端接口。 */
  demoAction: '/__mock/profile/orders/action',
  /** 试算或创建订单；main 网关。 */
  create: '/order/create',
  shopDetail: '/shop/subshop/detail',
  /** 查询列表；main 网关。 */
  list: '/order/list',
  /** 查询详情；main 网关。 */
  detail: '/order/detail',
  /** 取消订单；main 网关。 */
  close: '/order/close',
  /** 删除记录；main 网关。 */
  remove: '/order/delete',
  /** 使用余额支付订单；main 网关。 */
  payByBalance: '/order/pay',
  /** 确认收货；main 网关。 */
  delivery: '/order/delivery',
  /** 提交订单评价；main 网关。 */
  reputation: '/order/reputation',
  /** 核销订单；main 网关。 */
  hx: '/order/hx',
  /** 向桌台订单加菜；main 网关。 */
  cyTableAddOrder: '/cyTable/add-order',
  /** 提交退款申请；main 网关。 */
  refundApply: '/order/refundApply/apply',
  /** 查询退款申请；main 网关。 */
  refundApplyDetail: '/order/refundApply/info',
  /** 撤销退款申请；main 网关。 */
  refundApplyCancel: '/order/refundApply/cancel',
  /** 提交退货物流；main 网关。 */
  refundApplySetBackLogistics: '/order/refundApply/setBackLogistics',
} as const
