import type { ShopOrder } from './index'

export const orderCategories = [
  { key: 'dine-in', title: '堂食订单', type: '堂食', search: '桌号 / 订单尾号' },
  { key: 'delivery', title: '外卖订单', type: '外卖', search: '取餐号 / 订单尾号' },
  { key: 'pickup', title: '自取订单', type: '自取', search: '取餐号 / 订单尾号' },
  { key: 'booking', title: '预约订单', type: null, search: '' },
  { key: 'cashier', title: '收银订单', type: null, search: '收银流水号 / 订单尾号' },
] as const

export type OrderCategory = typeof orderCategories[number]['key']

/** Reads known category and dashboard links. Category takes priority. @example parseOrderListQuery({ category: 'dine-in' }) */
export function parseOrderListQuery(query?: { category?: unknown, filter?: unknown }) {
  const category = orderCategories.find(item => item.key === query?.category)?.key
  const filter = query?.filter
  const metric: 'today' | 'pending' | undefined = !category && (filter === 'today' || filter === 'pending') ? filter : undefined
  return { category, metric }
}

interface Filter {
  key: string
  label: string
  matches: (order: ShopOrder) => boolean
}

const all: Filter = { key: 'all', label: '全部', matches: () => true }
const unpaid: Filter = { key: 'unpaid', label: '未支付', matches: order => order.paymentStatus === 'unpaid' && order.status !== 5 }
const cancelled: Filter = { key: 'cancelled', label: '已取消', matches: order => order.status === 5 }
const refunds: Filter = { key: 'refunds', label: '退款单', matches: order => order.refundStatus !== undefined || order.status === 6 }
const pendingAcceptance: Filter = { key: 'pending', label: '待接单', matches: order => order.status === 1 }
const pendingVerification: Filter = { key: 'verification', label: '待核销', matches: order => order.status === 3 && order.pickupVerificationRequired === true }
const pendingPayment: Filter = { key: 'unpaid', label: '待收款', matches: order => unpaid.matches(order) && order.status !== 6 }

/** Maps summary status codes to the same filters used by the list. */
export const orderPendingFilters = {
  awaitingAcceptance: pendingAcceptance,
  awaitingVerification: pendingVerification,
  awaitingPayment: pendingPayment,
} as const

/** Returns the status filters available to the current order view. @example orderFilters('pickup', true) */
export function orderFilters(category: OrderCategory | undefined, owner: boolean): Filter[] {
  if (category === 'cashier') {
    return [
      all,
      pendingPayment,
      { key: 'paid', label: '已收款', matches: order => order.paymentStatus === 'paid' && order.status !== 5 },
      { ...cancelled, label: '已撤销' },
      refunds,
    ]
  }
  const handoff = category === 'dine-in' ? '待上菜' : category === 'pickup' ? '待取餐' : category === 'delivery' ? '待骑手取餐' : '待交付'
  const filters: Filter[] = [all]
  if (owner)
    filters.push(unpaid)
  filters.push(
    pendingAcceptance,
    { key: 'preparing', label: '待出餐', matches: order => order.status === 2 },
    { key: 'handoff', label: handoff, matches: order => order.status === 3 && order.deliveryStatus !== 'delivering' },
  )
  if (category === 'pickup')
    filters.push(pendingVerification)
  if (category === 'delivery' || !category)
    filters.push({ key: 'delivering', label: '配送中', matches: order => order.status === 3 && order.deliveryStatus === 'delivering' })
  if (owner) {
    if (category === 'delivery')
      filters.push({ key: 'delivered', label: '已送达', matches: order => order.status === 4 && order.deliveryStatus === 'delivered' })
    filters.push({ key: 'completed', label: category === 'pickup' ? '已取餐' : '已完成', matches: order => order.status === 4 && (category !== 'delivery' || order.deliveryStatus !== 'delivered') }, cancelled, refunds)
  }
  return filters
}

/** Tests category membership while retaining one record per order. @example matchesCategory(order, 'cashier') */
export function matchesCategory(order: ShopOrder, category?: OrderCategory) {
  if (category === 'cashier')
    return Boolean(order.cashier)
  return !category || orderCategories.find(item => item.key === category)?.type === order.type
}
