import type { Order, OrderFilter, OrderLogistics, RefundableGoods, RefundApply, RefundApplyRecord, ReputationItem } from '../models/types'
import { OrderStatus } from '../models/enums'

/** 仅按接口明确的 orderType 分类，不把未知订单误归类为自取或堂食。 */
export function filterOrders(orders: Order[], filter: OrderFilter): Order[] {
  return filter === 'all' ? orders : orders.filter(order => order.orderType === filter)
}

/** 订单状态键 → i18n 文案 key（order.status.*） */
export function orderStatusKey(status: number): string {
  switch (status) {
    case OrderStatus.CLOSED:
      return 'order.status.st01'
    case OrderStatus.PAID:
      return 'order.status.st10'
    case OrderStatus.SHIPPED:
      return 'order.status.st11'
    case OrderStatus.TO_EVALUATE:
    case OrderStatus.COMPLETED:
      return 'order.status.st3'
    default:
      return ''
  }
}

/** 只有待付款订单显示取消入口；实际取消仍由服务端校验。 */
export function canCancel(o: Pick<Order, 'status'>) {
  return o.status === OrderStatus.UNPAID
}

/** 只有待付款订单显示支付入口，不依据本地状态推断支付成功。 */
export function canPay(o: Pick<Order, 'status'>) {
  return o.status === OrderStatus.UNPAID
}

/** 仅允许对已取消或已完成订单显示删除记录入口。 */
export function canDelete(o: Pick<Order, 'status'>) {
  return o.status === OrderStatus.CLOSED || o.status === OrderStatus.COMPLETED
}

/** 只有配送中订单显示确认收货入口。 */
export function canConfirmReceive(o: Pick<Order, 'status'>) {
  return o.status === OrderStatus.SHIPPED
}

/** 只有待评价订单显示评价入口。 */
export function canEvaluate(o: Pick<Order, 'status'>) {
  return o.status === OrderStatus.TO_EVALUATE
}

/** 售后状态 → i18n key（refund.status.s*） */
export function refundStatusKey(status: number) {
  return `refund.status.s${status}`
}

/**
 * 订单列表的状态文案 key（原 all-orders doneShow 中对 statusStr 的覆盖）
 * 返回空串表示沿用接口返回的 statusStr
 */
export function orderListStatusKey(o: Pick<Order, 'status' | 'isNeedLogistics'>): string {
  if (o.status === OrderStatus.CLOSED) {
    return 'order.status.st01'
  }
  if (o.status === OrderStatus.PAID) {
    return o.isNeedLogistics ? 'order.status.st11' : 'order.status.st10'
  }
  if (o.status === OrderStatus.TO_EVALUATE) {
    return 'order.status.st3'
  }
  return ''
}

/** 列表页按钮规则（与 all-orders/index.wxml 一致） */
export function canCallShop(o: Pick<Order, 'status'>) {
  return o.status > 0
}

/** 列表页“删除订单”：仅已取消或已完成；待评价仍保留，避免用户丢失评价入口 */
export function canDeleteInList(o: Pick<Order, 'status'>) {
  return canDelete(o)
}

/** 列表页“退换货”入口 */
export function canApplyRefund(o: Pick<Order, 'status'>) {
  return o.status > 0
}

/** 订单列表 logisticsMap 中取某订单的配送信息 */
export function logisticsOf(map: Record<string, unknown> | null | undefined, orderId: number | string): OrderLogistics | undefined {
  const v = map?.[String(orderId)]
  return v && typeof v === 'object' ? (v as OrderLogistics) : undefined
}

/** 收货地址拼接（省市区 + 详细地址） */
export function fullAddress(l?: OrderLogistics | null, sep = ''): string {
  if (!l) {
    return ''
  }
  return [l.provinceStr, l.cityStr, l.areaStr, l.address].filter(Boolean).join(sep)
}

/**
 * 支付记录 nextAction → 订单 id（原 order-details payLogs）
 * 不是“支付订单”(type=0) 的记录返回 null
 */
export function orderIdFromPayNextAction(nextAction?: string | null): number | string | null {
  if (!nextAction) {
    return null
  }
  try {
    const obj = JSON.parse(nextAction) as { type?: number | string, id?: number | string }
    if (Number(obj.type) !== 0 || obj.id === undefined || obj.id === null) {
      return null
    }
    return obj.id
  }
  catch {
    return null
  }
}

/** 组装 orderReputation 的 postJsonString（原 submitReputation） */
export function buildReputationPostJson(token: string, orderId: number | string, items: ReputationItem[]): string {
  return JSON.stringify({
    token,
    orderId,
    reputations: items.map(i => ({ id: i.id, reputation: i.reputation, remark: i.remark })),
  })
}

/** 售后记录关联订单商品（原 orderDetail 中 ele.goodInfo = goods.find(...)） */
export function attachRefundGoods(list: RefundApply[] | null | undefined, goods: RefundableGoods[]): RefundApplyRecord[] {
  return (list || []).map((r) => {
    const rec = r as RefundApplyRecord
    return { ...rec, goodInfo: goods.find(g => g.id === Number(rec.baseInfo.orderGoodsId)) }
  })
}
