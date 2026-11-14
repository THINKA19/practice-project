import type { ShopSettingsForm } from '../models/index'
import { authorize } from '@/pages-shop/auth/permissions/mock'
import { orders } from '@/pages-shop/order/list/mock'
import { endpoints } from '../api/endpoints'
import { settings } from './settings-state'
export { savedShopOverview } from './settings-state'
const events = new Map<string, { known: Map<string, number>, events: { id: string, sequence: number, shopId: string, kind: string, orderId: string, tableNo: string }[] }>()
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value))
/** 门店设置和事件模拟。@param endpoint 路径 @param data 参数 @param token 凭证 @returns 设置或事件 @example handle(endpoints.settings, {shopId:'A'}, token) // 设置 */
export function handle(endpoint: string, data: Record<string, unknown>, token: string): unknown {
  const id = String(data.shopId); const shop = authorize(token, id, endpoint === endpoints.events ? 'order.read' : 'shop.settings.manage')
  if (endpoint === endpoints.events) {
    const list = orders(token, id)
    if (!events.has(id)) events.set(id, { known: new Map(list.map(o => [o.id, o.status])), events: [] })
    const state = events.get(id)!
    for (const order of list) {
      const previous = state.known.get(order.id)
      if (previous === undefined || (previous !== 3 && order.status === 3)) { const sequence = state.events.length + 1; state.events.push({ id: id + '-event-' + sequence, sequence, shopId: id, kind: previous === undefined ? 'new-order' : 'ready', orderId: order.id, tableNo: order.tableNo }) }
      state.known.set(order.id, order.status)
    }
    return copy({ cursor: state.events.length, events: data.after === undefined ? [] : state.events.filter(e => e.sequence > Number(data.after)) })
  }
  if (!settings.has(id)) settings.set(id, { version: 1, form: { shopName: shop.name, shopLogo: '/static/images/default-avatar.png', shopPhoto: '', shopType: '餐饮', contact: '0000000000', address: '开发测试地址', longitude: 0, latitude: 0, description: '', businessStatus: true, businessHours: [{ day: '每日', open: '09:00', close: '22:00', on: true }], delivery: true, dineIn: true, takeAway: true, minOrderAmount: 0, deliveryFee: 5, freeDeliveryThreshold: 50, deliveryRadius: 3, notice: '', autoReceive: false, autoPrint: false, soundNotify: true } })
  const state = settings.get(id)!
  if (endpoint === endpoints.settings) return copy(state)
  if (endpoint !== endpoints.save || state.version !== data.version) throw new Error('门店设置已更新，请重新加载')
  const form = JSON.parse(String(data.form)) as ShopSettingsForm
  if (!form.shopName?.trim() || !form.address?.trim() || !Array.isArray(form.businessHours) || ![form.minOrderAmount, form.deliveryFee, form.freeDeliveryThreshold, form.deliveryRadius].every(v => Number.isFinite(v) && v >= 0)) throw new Error('门店设置无效')
  state.form = copy(form); state.version++; return copy(state)
}
/** 清空设置和事件。无参数。@returns void @example reset() // 清空 */
export function reset() { settings.clear(); events.clear() }
