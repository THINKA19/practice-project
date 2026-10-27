import type { Order, OrderGoods } from '../models/types'
import { mockCustomerOwner } from '@/pages/auth/session/mock'

const accounts = new Map<string, Order[]>()
export function rows(authorization: unknown) {
  if (!/^Bearer wx-demo-session-\S+$/.test(String(authorization)))
    throw new Error('请先登录顾客账户')
  const owner = mockCustomerOwner(authorization)
  if (!accounts.has(owner)) {
    accounts.set(owner, [
      { id: 1001, shopId: 1, shopNameZt: '街角餐厅', status: 0, statusStr: '待付款', dateAdd: '2026-10-25 12:30', orderNumber: 'DEMO1001', amountReal: 58.5, orderType: 'delivery', demo: true },
      { id: 1002, shopId: 2, shopNameZt: '柠檬茶饮店', status: 0, statusStr: '待付款', dateAdd: '2026-10-25 11:30', orderNumber: 'DEMO1002', amountReal: 32, orderType: 'pickup', demo: true },
      { id: 1003, shopId: 1, shopNameZt: '街角餐厅', status: 4, statusStr: '已完成', dateAdd: '2026-10-24 12:30', orderNumber: 'DEMO1003', amountReal: 45.8, orderType: 'reservation', demo: true },
      { id: 1005, shopId: 2, shopNameZt: '柠檬茶饮店', status: 1, statusStr: '已付款，待取餐', dateAdd: '2026-10-25 13:00', orderNumber: 'DEMO1005', amountReal: 28, orderType: 'pickup', isPay: true, demo: true },
      { id: 1006, shopId: 1, shopNameZt: '街角餐厅', status: 2, statusStr: '配送中', dateAdd: '2026-10-25 12:45', orderNumber: 'DEMO1006', amountReal: 42, orderType: 'delivery', isPay: true, demo: true },
      { id: 1007, shopId: 1, shopNameZt: '街角餐厅', status: 3, statusStr: '待评价', dateAdd: '2026-10-25 10:45', orderNumber: 'DEMO1007', amountReal: 36, orderType: 'dinein', isPay: true, demo: true },
      { id: 1004, shopId: 1, shopNameZt: '街角餐厅', status: -1, statusStr: '已取消', dateAdd: '2026-10-23 12:30', orderNumber: 'DEMO1004', amountReal: 36, orderType: 'dinein', demo: true },
    ])
  }
  return accounts.get(owner)!
}
/** 清空开发账户订单，下次查询恢复样本。 */
export function reset() {
  accounts.clear()
}

/** 由既有订单详情 Mock 调用，找不到时继续原取餐业务。 */
export function profileOrderDetail(id: unknown, authorization: unknown) {
  if (!/^Bearer wx-demo-session-\S+$/.test(String(authorization)))
    return null
  const row = rows(authorization).find(item => item.id === Number(id))
  return row ? { orderInfo: { ...row, shopImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=320' }, goods: goodsFor(row) } : null
}

/** 本地占位图与商品样本，列表、详情共用同一份商品数据。 */
export function goodsFor(order: Order): OrderGoods[] {
  const names = order.orderType === 'pickup' ? ['冰鲜柠檬水', '珍珠奶茶'] : ['招牌汉堡', '香脆薯条', '冰可乐']
  const pictures = order.orderType === 'pickup'
    ? ['https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?w=320', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=320']
    : ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=320', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=320', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=320']
  return names.map((goodsName, index) => ({ id: order.id * 10 + index, goodsId: index + 1, goodsName, pic: pictures[index], number: index + 1, amount: order.amountReal / names.length, amountSingle: order.amountReal / names.length / (index + 1), afterSale: order.status > 0 ? '0,1,2' : '' }))
}
