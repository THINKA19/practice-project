import type { VerificationGoods, VerificationOrder } from './types'

/**
 * 将页面参数或扫码内容转换为核销码，不执行二维码中的 URL。
 * @param value 未校验的输入。
 * @returns 去除首尾空白的字符串；非字符串返回空串。
 * @example normalizeVerificationCode(' CODE ') // 'CODE'
 */
export function normalizeVerificationCode(value: unknown): string {
  if (typeof value !== 'string')
    return ''
  const text = value.trim()
  if (!text || text.length > 2048)
    return ''
  // 兼容带 hxNumber 的取餐二维码，只提取码，不导航到二维码地址。
  if (text.includes('?')) {
    const query = text.slice(text.indexOf('?') + 1).split('#')[0]
    const codes = query.split('&').filter(part => part.split('=')[0] === 'hxNumber')
    if (codes.length !== 1)
      return ''
    try {
      const code = decodeURIComponent(codes[0].slice('hxNumber='.length)).trim()
      return code && !/[\s/?#&=]/.test(code) ? code : ''
    }
    catch {
      return ''
    }
  }
  return /[\s/?#&=:]/.test(text) ? '' : text
}

/** 判断外部值是否为非空对象；具体字段仍由后续核销转换函数校验。 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object'
}

/** 校验核销订单商品的展示必需字段，再转换为前端商品模型。 */
export function parseGoods(value: unknown): VerificationGoods {
  if (!isRecord(value)
    || (typeof value.id !== 'string' && typeof value.id !== 'number')
    || typeof value.goodsName !== 'string'
    || typeof value.number !== 'number'
    || !Number.isInteger(value.number)
    || value.number <= 0) {
    throw new Error('核销商品字段无效')
  }
  return { id: value.id, goodsName: value.goodsName, number: value.number }
}

/**
 * 从订单响应提取当前页面必需字段；无效响应不能进入页面状态。
 * @param value 公共客户端解包后的不可信 data。
 * @returns 本页面的核销订单。
 * @example parseVerificationOrder({ orderInfo: { status: 1, amountReal: 12 }, goods: [] })
 */
export function parseVerificationOrder(value: unknown): VerificationOrder {
  if (!isRecord(value) || !isRecord(value.orderInfo) || !Array.isArray(value.goods))
    throw new Error('核销订单格式无效')
  const info = value.orderInfo
  if (typeof info.status !== 'number'
    || !Number.isInteger(info.status)
    || typeof info.amountReal !== 'number'
    || !Number.isFinite(info.amountReal)
    || info.amountReal < 0) {
    throw new Error('核销订单字段无效')
  }
  return {
    status: info.status,
    preparing: info.fulfillment === 'preparing',
    amountReal: info.amountReal,
    goods: value.goods.map(parseGoods),
  }
}
