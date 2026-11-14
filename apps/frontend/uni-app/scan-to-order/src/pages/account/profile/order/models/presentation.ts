import type { Order } from './types'

/**
 * 优先订单自身资料，其次下单时保存的扩展快照。
 * @param order 服务端订单。
 * @returns 计价国家、门店图片与名称，不读取当前选店。
 * @example orderPresentation({ countryCode: 'VN' }).countryCode // => VN
 */
export function orderPresentation(order: Partial<Order>) {
  let ext: Record<string, unknown> = order.extJson || {}
  try {
    if (order.extJsonStr)
      ext = JSON.parse(order.extJsonStr) || {}
  }
  catch {}
  const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
  return {
    countryCode: text(order.countryCode) || text(ext['计价国家']),
    shopImage: text(order.shopImage) || text(ext['门店照片']),
    shopNameZt: text(order.shopNameZt) || text(ext['门店名称']),
  }
}
