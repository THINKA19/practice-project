/**
 * ============================================================================
 * 门店订单模拟服务
 * ============================================================================
 *
 * 【文件概述】
 * 提供单门店演示数据、取餐展示号与权限约束下的履约变化。
 *
 * 【方法与导出清单】
 * - orders：读取订单。
 * - createOrder：生成演示新单。
 * - handle：模拟列表查询。
 * - getOrderRecord：供详情 Mock 操作同一份订单。
 * - reset：清除模拟状态。
 *
 * 【综合使用示例】
 * ```typescript
 * import { createOrder } from '@/pages-shop/order/list/mock'
 * // 工作台使用已认证的 token 和当前 shopId 创建演示单
 * const createDemo = (token: string, shopId: string) => createOrder(token, shopId)
 * ```
 * ============================================================================
 */
import type { ShopOrder } from '../models/index'
import { authorize } from '@/pages-shop/auth/permissions/mock'
import { hasShopPermission } from '@/pages-shop/auth/permissions/models/policy'
import { isFulfillmentOrder, withoutOrderAmounts } from '../models/fulfillment'
import { endpoints } from '../api/endpoints'

export { list as bookings } from './bookings'

const records = new Map<string, ShopOrder[]>()
const labels = ['', '待接单', '制作中', '待取餐/配送', '已完成', '已取消', '售后']
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value))
/** 单门店订单事实。@param token 凭证 @param shopId 门店 @returns 独立副本 @example orders(token, 'A') // A 店订单 */
export function orders(token: string, shopId: string, permission: 'order.read' | 'statistics.read' | 'delivery.read' | 'delivery.dispatch' = 'order.read'): ShopOrder[] {
  const shop = authorize(token, shopId, permission)
  if (!records.has(shopId)) {
    records.set(shopId, [1, 2, 3].map((status, i) => ({ id: `${shopId}-ORDER-${i + 1}`, shopId, version: 1, createdAt: new Date().toISOString(), time: new Date().toLocaleTimeString(), address: '测试地址（非真实配送）', customer: '测试顾客', phone: '', timeline: [{ t: new Date().toISOString(), s: '测试订单创建', done: true }], tableNo: i === 0 ? 'A01' : '—', ...(i ? { pickupNumber: `#${String(i + 1).padStart(3, '0')}` } : {}), type: i === 0 ? '堂食' : i === 1 ? '自取' : '外卖', pickupVerificationRequired: i === 1, paymentStatus: i === 0 ? 'unpaid' : 'paid', ...(i === 0 ? { cashier: { number: `${shopId}-POS-001` } } : {}), status: status as ShopOrder['status'], statusText: labels[status], goods: [{ name: '招牌套餐', qty: 1, price: 28 }], amount: 28, remark: '开发测试订单' })))
    const sample = records.get(shopId)!
    for (const order of sample) {
      if (order.paymentStatus === 'paid')
        order.timeline.push({ t: order.createdAt, s: '已收款', done: true })
    }
    const types = ['堂食', '自取', '外卖'] as const
    const now = Date.now()
    const extraGoods = [
      { productId: 'mock-fried-rice', name: '泰式炒饭', qty: 1, price: 35 },
      { productId: 'mock-spring-roll', name: '炸春卷', qty: 2, price: 10 },
      { productId: 'mock-milk-tea', name: '泰式奶茶', qty: 1, price: 18 },
      { productId: 'mock-chicken', name: '香烤鸡腿', qty: 1, price: 32 },
      { productId: 'mock-noodles', name: '招牌炒面', qty: 2, price: 26 },
      { productId: 'mock-soup', name: '冬阴功汤', qty: 1, price: 38 },
      { productId: 'mock-salad', name: '青木瓜沙拉', qty: 2, price: 22 },
      { productId: 'mock-rice', name: '椰香糯米饭', qty: 1, price: 20 },
    ]
    for (const [typeIndex, type] of types.entries()) {
      for (let index = 0; index < 30; index++) {
        const number = sample.length + 1
        const status = (index % 6 + 1) as ShopOrder['status']
        const age = index >= 24 ? [15, 22, 30, 38, 45, 52][index - 24] : index % 12 < 4 ? 0 : index % 12 - 3
        const created = new Date(now - age * 86_400_000)
        const goods = index % 2
          ? [{ name: '招牌套餐', qty: 1, price: 28 }]
          : [
              { name: '招牌套餐', qty: 2, price: 28 },
              { name: '柠檬茶', qty: 1, price: 12 },
            ]
        if (index % 6 === 0 || index >= 24)
          goods.push(...extraGoods)
        const paymentStatus = status === 1 && index % 4 === 0 ? 'unpaid' : 'paid'
        const createdAt = created.toISOString()
        const timeline = [{ t: createdAt, s: '测试订单创建', done: true }]
        if (paymentStatus === 'paid')
          timeline.push({ t: createdAt, s: '已收款', done: true })
        if (status === 6)
          timeline.push({ t: new Date(Math.min(now, created.getTime() + 2 * 86_400_000)).toISOString(), s: '已退款', done: true })
        const deliveryStatus = status === 4 ? 'delivered' : status === 3 && index % 4 === 0 ? 'delivering' : undefined
        sample.push({
          type,
          id: [shopId, 'ORDER', number].join('-'),
          shopId,
          version: 1,
          createdAt,
          time: created.toLocaleTimeString(),
          address: type === '外卖' ? '测试地址（非真实配送）' : '',
          customer: `测试顾客 ${number}`,
          phone: '',
          timeline,
          tableNo: type === '堂食' ? `A${String(index % 8 + 1).padStart(2, '0')}` : '—',
          pickupNumber: type === '堂食' ? undefined : `#${String(number).padStart(3, '0')}`,
          pickupVerificationRequired: type === '自取' && index % 2 === 0,
          cashier: typeIndex !== 2 ? { number: [shopId, 'POS', String(number).padStart(3, '0')].join('-') } : undefined,
          paymentStatus,
          deliveryStatus: type !== '外卖' ? undefined : deliveryStatus,
          refundStatus: status === 6 ? 'refunded' : undefined,
          status,
          statusText: labels[status],
          goods,
          amount: goods.reduce((sum, item) => sum + item.qty * item.price, 0),
          remark: index % 5 === 0 ? '开发测试订单' : '',
        })
      }
    }
  }
  const list = records.get(shopId)!
  const scoped = shop.roleTemplate === 'owner' ? list : list.filter(isFulfillmentOrder)
  return copy(hasShopPermission(shop, 'order.amount.read') ? scoped : scoped.map(withoutOrderAmounts))
}
/** 生成待接单样本。@param token 凭证 @param shopId 门店 @returns 新订单 @example createOrder(token, 'A') // 新单 */
export function createOrder(token: string, shopId: string) {
  const shop = authorize(token, shopId, 'order.read')
  orders(token, shopId)
  const list = records.get(shopId)!
  const now = new Date()
  const order: ShopOrder = {
    ...list[0],
    cashier: undefined,
    paymentStatus: 'paid',
    id: [shopId, 'ORDER', list.length + 1].join('-'),
    status: 1,
    statusText: labels[1],
    version: 1,
    createdAt: now.toISOString(),
    time: now.toLocaleTimeString(),
    timeline: [{ t: now.toISOString(), s: '已收款', done: true }],
  }
  list.push(order)
  return copy(hasShopPermission(shop, 'order.amount.read') ? order : withoutOrderAmounts(order))
}
/**
 * 查询列表 Mock 的订单。
 * @param endpoint 列表接口路径。
 * @param data 带有门店 ID 的请求参数。
 * @param token 模拟会话凭证。
 * @returns 当前门店可见订单的副本。
 * @example handle(endpoints.list, { shopId: 'A' }, token) // => A 店的可见订单
 */
export function handle(endpoint: string, data: Record<string, unknown>, token: string) {
  if (endpoint !== endpoints.list)
    throw new Error('未知订单列表接口')
  return orders(token, String(data.shopId))
}

/**
 * 获取授权范围内的模拟订单及共享记录，仅供详情 Mock 使用。
 * @param token 模拟会话凭证。
 * @param shopId 门店编号。
 * @param id 订单编号。
 * @returns 已脱敏的副本与用于履约写入的原记录，越权时抛出错误。
 * @example getOrderRecord(token, 'A', 'A-ORDER-1') // => 本店订单及原记录
 */
export function getOrderRecord(token: string, shopId: string, id: unknown) {
  const visible = orders(token, shopId).find(order => order.id === id)
  const record = records.get(shopId)?.find(order => order.id === id)
  if (!visible || !record)
    throw new Error('订单不存在')
  return { visible, record }
}

/** 重置订单。无参数。@returns void @example reset() // 清空 */
export function reset() {
  records.clear()
}
