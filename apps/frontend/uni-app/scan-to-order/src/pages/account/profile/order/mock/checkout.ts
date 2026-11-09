/** 开发结算接口：根据商品样本重新定价，试算不创建订单，也不模拟真实支付。 */
import type { OrderGoods } from '../models/types'
import { additions, goods, quoteMockSku } from '@/pages/ordering/menu/mock'
import { shops } from '@/pages/ordering/index/mock'
import { fail, ok } from '@/mock/response'
import { rows, saveCheckoutOrder } from './state'
import { isCashOrder } from '../domain/order.rules'

interface Item { goodsId: number, number: number, propertyChildIds?: string, goodsAdditionList?: Array<{ pid: number, id: number }> }
/** 处理演示结算试算与创建。@param authorization 当前演示身份。@param input 下单协议。@returns Mock 响应。@example checkout(token, payload) */
export function checkout(authorization: unknown, input: Record<string, unknown>) {
  const orders = rows(authorization)
  const shop = shops.find(row => row.id === Number(input.shopIdZt))
  const delivery = input.peisongType === 'kd'
  if (!shop || !['zq', 'kd'].includes(String(input.peisongType)) || (delivery ? !shop.openWaimai : !shop.openZiqu))
    return fail('当前门店不支持此取餐方式')
  if (delivery && (!input.address || !input.mobile || !input.linkMan))
    return fail('请完善收货地址和联系方式')
  if (input.couponId || input.cardId || input.trips)
    return fail('演示结算暂不支持该优惠或包装收费，请取消后重试')
  let items: Item[]
  try {
    const parsed: unknown = JSON.parse(String(input.goodsJsonStr))
    if (!Array.isArray(parsed) || !parsed.length)
      return fail('请选择商品')
    items = parsed as Item[]
  }
  catch {
    return fail('商品参数无效')
  }
  const detail: OrderGoods[] = []
  const quantities = new Map<number, number>()
  for (const item of items) {
    const product = goods.find(row => row.id === item?.goodsId && row.shopId === shop.id)
    if (!product || !Number.isSafeInteger(item.number) || item.number < product.minBuyNumber)
      return fail('商品或数量无效')
    const quantity = (quantities.get(product.id) || 0) + item.number
    quantities.set(product.id, quantity)
    if (quantity > product.stores)
      return fail('商品库存不足')
    const sku = item.propertyChildIds || ''
    const skuPrice = quoteMockSku(product.id, sku)
    if (skuPrice === null)
      return fail('商品规格无效')
    const extras = item.goodsAdditionList || []
    if (!Array.isArray(extras) || (!product.hasAddition && extras.length) || new Set(extras.map(row => `${row?.pid}:${row?.id}`)).size !== extras.length)
      return fail('商品加料无效')
    let extraPrice = 0
    for (const extra of extras) {
      const option = additions.flatMap(group => group.items).find(row => row.pid === extra?.pid && row.id === extra?.id)
      if (!option)
        return fail('商品加料无效')
      extraPrice += option.price
    }
    const price = skuPrice + extraPrice
    detail.push({ id: detail.length + 1, goodsId: product.id, goodsName: product.name, pic: product.pic, number: item.number, amountSingle: price, amount: Math.round(price * 100) * item.number / 100 })
  }
  const amountTotle = detail.reduce((sum, row) => sum + Math.round(row.amount * 100), 0) / 100
  // 仅演示本店固定配送费；实际费用必须由服务端按门店规则报价。
  const amountLogistics = delivery ? 3 : 0
  const quote = { amountTotle, amountLogistics, amountReal: amountTotle + amountLogistics, goodsNumber: detail.reduce((sum, row) => sum + row.number, 0), couponUserList: [], score: 0 }
  if (input.calculate === 'true')
    return ok(quote)
  if (delivery && amountTotle < Number(shop.serviceAmountMin || 0))
    return fail('未达到门店起送金额')
  if (typeof input.requestId !== 'string' || !input.requestId)
    return fail('缺少下单请求标识')
  const existing = orders.find(row => row.requestId === input.requestId)
  if (existing)
    return ok(existing)
  const id = Math.max(10000, ...orders.map(row => row.id)) + 1
  const extJsonStr = String(input.extJsonStr || '{}')
  const row = { id, orderNumber: `DEMO${id}`, status: 0, statusStr: isCashOrder({ extJsonStr }) ? '待现金结算' : '待付款', extJsonStr, dateAdd: new Date().toISOString(), shopId: shop.id, shopIdZt: shop.id, shopNameZt: shop.name, countryCode: shop.countryCode, shopImage: shop.photos?.[0] || shop.pic, orderType: delivery ? 'delivery' as const : 'pickup' as const, peisongType: String(input.peisongType), demo: true, requestId: input.requestId, remark: String(input.remark || ''), ...quote }
  saveCheckoutOrder(authorization, row, detail, delivery ? { address: String(input.address), linkMan: String(input.linkMan), mobile: String(input.mobile) } : undefined)
  return ok(row)
}
