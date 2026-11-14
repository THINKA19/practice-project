const meta = (text: string, color = '#237a50') => ({ text, color, bg: `${color}18`, className: '' })
export const SHOP_ORDER_STATUS = { 1: meta('待接单'), 2: meta('制作中'), 3: meta('待取餐/配送'), 4: meta('已完成'), 5: meta('已取消'), 6: meta('售后') }
export const SHOP_ORDER_TABS = [0, 1, 2, 3, 4, 5, 6].map(key => ({ key, label: key === 0 ? '全部' : SHOP_ORDER_STATUS[key as keyof typeof SHOP_ORDER_STATUS].text }))
export function setShopOrderStatus<T extends { status: 1 | 2 | 3 | 4 | 5 | 6, statusText: string }>(order: T, status: T['status']) {
  order.status = status
  order.statusText = SHOP_ORDER_STATUS[status].text
}
