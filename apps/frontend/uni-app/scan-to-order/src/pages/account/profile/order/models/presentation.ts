import type { Order } from './types'
import { formatOrderingPrice } from '@/pages/ordering/index'

/** 优先订单自身资料，其次下单时保存的扩展快照。
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

/** 同一订单的商品金额、合计统一使用自己的计价国家。
 * @param order 服务端订单及展示快照。
 * @param amount 商品或订单金额。
 * @param locale 当前语言。
 * @returns 金额文本；缺少币种时明确提示。
 * @example formatOrderPrice({ countryCode: 'VN' }, 28, 'zh-Hans') // => ₫28万 越南盾
 */
export function formatOrderPrice(order: Partial<Order>, amount: number | string | undefined, locale: string) {
  const country = orderPresentation(order).countryCode
  return country ? formatOrderingPrice(country, amount, locale) : `${amount ?? ''}（币种待确认）`
}
