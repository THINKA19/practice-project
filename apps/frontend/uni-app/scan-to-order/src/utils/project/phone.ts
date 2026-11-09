/** 电话国家配置及格式规则；不依赖地址、账号或订单，不验证号码是否实际开通。 */
export const PHONE_COUNTRIES = [
  { code: 'CN', name: '中国', dial: '86', min: 11, max: 11 },
  { code: 'VN', name: '越南', dial: '84', min: 9, max: 9 },
  { code: 'LA', name: '老挝', dial: '856', min: 10, max: 10 },
  { code: 'TH', name: '泰国', dial: '66', min: 9, max: 9 },
  { code: 'ID', name: '印度尼西亚', dial: '62', min: 9, max: 12 },
] as const

export type PhoneCountry = typeof PHONE_COUNTRIES[number]['code']

/** 基础格式校验并转为国际格式，不验证号码归属或是否开通。 */
export function internationalPhone(value: string, countryCode = 'VN'): string | null {
  const country = PHONE_COUNTRIES.find(item => item.code === countryCode)
  if (!country)
    return null
  let number = value.trim().replace(/[\s()-]/g, '')
  if (number.startsWith('+')) {
    if (!number.startsWith(`+${country.dial}`))
      return null
    number = number.slice(country.dial.length + 1)
  }
  if (country.code !== 'CN')
    number = number.replace(/^0/, '')
  if (!/^\d+$/.test(number) || number.length < country.min || number.length > country.max)
    return null
  return `+${country.dial}${number}`
}

/** 回填国际号码的区号，旧中国本地号码保留中国区号。 */
export function phoneCountryOf(value: string): PhoneCountry {
  return PHONE_COUNTRIES.find(country => value.startsWith(`+${country.dial}`))?.code || (/^1\d{10}$/.test(value) ? 'CN' : 'VN')
}
