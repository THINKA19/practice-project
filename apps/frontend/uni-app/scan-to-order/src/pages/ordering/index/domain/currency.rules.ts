/** 金额沿用接口计价单位，不进行汇率换算。
 * @param countryCode 门店或订单自身国家代码。
 * @param locale 当前语言。
 * @returns 币种符号、计价单位与名称。
 * @example orderingCurrency('VN', 'zh-Hans') // => 越南盾，万计
 */
export function orderingCurrency(countryCode: string | undefined, locale: string) {
  const country = countryCode?.trim().toUpperCase() || ''
  const symbols: Record<string, string> = { VN: '₫', LA: '₭', TH: '฿', CN: '¥' }
  const names: Record<string, string[]> = { VN: ['越南盾', 'VND', 'đồng'], LA: ['基普', 'LAK', 'kip'], TH: ['泰铢', 'THB', 'baht'], CN: ['人民币', 'CNY', 'CNY'] }
  const index = locale === 'zh-Hans' ? 0 : locale === 'vi' ? 2 : 1
  const unit = country === 'VN' || country === 'LA' ? (locale === 'zh-Hans' ? '万' : locale === 'vi' ? ' vạn' : ' ×10⁴') : ''
  return { symbol: symbols[country] || '', unit, name: names[country]?.[index] || '' }
}

/** 按指定订单或门店国家格式化，不转换数值。
 * @param countryCode 门店或订单自身国家代码。
 * @param amount 接口金额。
 * @param locale 当前语言，默认简体中文。
 * @returns 带币种、单位的金额文本。
 * @example formatOrderingPrice('VN', 28) // => ₫28万 越南盾
 */
export function formatOrderingPrice(countryCode: string | undefined, amount: number | string | undefined | null, locale = 'zh-Hans') {
  const { symbol, unit, name } = orderingCurrency(countryCode, locale)
  return `${symbol}${amount ?? ''}${unit}${name ? ` ${name}` : ''}`
}
