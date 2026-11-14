/**
 * ============================================================================
 * 门店订单展示
 * ============================================================================
 *
 * 【文件概述】
 * 统一订单列表和详情使用的识别号、交付状态与时间展示规则。
 *
 * 【方法与导出清单】
 * - formatOrderTime、orderReference、orderStatusLabel：生成一致的订单展示字段。
 *
 * 【综合使用示例】
 * ```typescript
 * import { formatOrderTime } from '@/pages-shop/order/list/models/presentation'
 * formatOrderTime('2026-11-13T17:07:31Z', { day: '2026-11-14', hour: 0 }) // => '11-14 00:07'
 * ```
 * ============================================================================
 */
import type { ShopOrder } from './index'

/**
 * 按已经计算好的门店日期和小时显示订单时间。
 * @param value ISO 时间字符串，可省略。
 * @param local 门店时钟返回的日期与小时。
 * @returns 月日与时分，缺少有效时间时返回空字符串。
 * @example formatOrderTime('2026-11-13T17:07:31Z', { day: '2026-11-14', hour: 0 }) // => '11-14 00:07'
 */
export function formatOrderTime(value?: string, local?: { day: string, hour: number }) {
  const time = Date.parse(value ?? '')
  if (!local || !Number.isFinite(time))
    return ''
  return `${local.day.slice(5)} ${String(local.hour).padStart(2, '0')}:${String(new Date(time).getUTCMinutes()).padStart(2, '0')}`
}

/**
 * 解析店员核对订单时使用的可见标识。
 * @param order 订单类型、原始桌号、取餐展示号及订单编号。
 * @returns 供页面翻译的标签和标识值。
 * @example orderReference({ type: '自取', tableNo: '—', pickupNumber: '#012', id: 'A-012' }) // => { label: '取餐号', value: '#012' }
 */
export function orderReference(order: Pick<ShopOrder, 'type' | 'tableNo' | 'pickupNumber' | 'id'>) {
  const table = order.tableNo.trim()
  if (order.type === '堂食' && table && table !== '—' && table !== '-')
    return { label: '桌号', value: table }
  if (order.type !== '堂食' && order.pickupNumber?.trim())
    return { label: '取餐号', value: order.pickupNumber.trim() }
  return { label: '订单尾号', value: order.id.slice(-6) }
}

/**
 * 根据订单类型展示出餐后的交付状态。
 * @param order 门店订单的状态、渠道和服务端状态文案。
 * @returns 可供页面翻译的状态文案。
 * @example orderStatusLabel({ status: 3, type: '堂食', statusText: '待取餐/配送' }) // => '待上菜'
 */
export function orderStatusLabel(order: Pick<ShopOrder, 'status' | 'type' | 'statusText' | 'deliveryStatus'>) {
  if (order.type === '外卖' && order.status === 3 && order.deliveryStatus === 'delivering')
    return '配送中'
  if (order.type === '外卖' && order.status === 4 && order.deliveryStatus === 'delivered')
    return '已送达'
  if (order.type === '自取' && order.status === 4)
    return '已取餐'
  if (order.status !== 3)
    return order.statusText
  if (order.type === '堂食')
    return '待上菜'
  if (order.type === '自取')
    return '待取餐'
  return '待骑手取餐'
}
