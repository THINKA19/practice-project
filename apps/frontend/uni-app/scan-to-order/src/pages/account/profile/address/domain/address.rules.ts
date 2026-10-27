import type { Address, AddressForm, DeliveryCountry, PhoneCountry } from '../models/types'
import { DELIVERY_COUNTRIES, DELIVERY_REGIONS, PHONE_COUNTRIES } from '../models/enums'

/** 校验地址表单，返回错误 i18n key；通过返回 null */
export function validateAddress(f: AddressForm): string | null {
  if (!f.linkMan?.trim()) {
    return 'account.profile.address.linkManPlaceholder'
  }

  if (!internationalPhone(f.mobile || '', f.phoneCountry || 'VN')) {
    return 'account.profile.address.mobilePlaceholder'
  }

  if (!DELIVERY_COUNTRIES.some(country => country.code === f.countryCode)) {
    return 'account.profile.address.countryPlaceholder'
  }

  if (!deliveryRegions(f.countryCode || '').includes(f.regionText?.trim() || '')) {
    return 'account.profile.address.regionPlaceholder'
  }

  if (!f.address?.trim()) {
    return 'account.profile.address.addressPlaceholder'
  }

  return null
}

/** 保存校验不要求地图坐标或中国行政区编号。 */
export function checkAddressDraft(f: Partial<AddressForm>): string | null {
  return validateAddress({ linkMan: '', mobile: '', address: '', ...f })
}

/** 优先拼接国家、地区和文字地址；没有国家配置时兼容旧省市区字段。 */
export function fullAddress(a: Partial<Address>): string {
  const country = DELIVERY_COUNTRIES.find(item => item.code === a.countryCode)
  if (country)
    return [country.name, a.regionText, a.address].filter(Boolean).join(' · ')
  return [a.provinceStr, a.cityStr, a.areaStr, a.address].filter(Boolean).join(' ')
}

/** 默认地址置顶，保持其余地址原有相对顺序，不修改传入数组。 */
export function defaultAddressFirst(addresses: Address[]): Address[] {
  return [...addresses.filter(address => address.isDefault === true), ...addresses.filter(address => address.isDefault !== true)]
}

/** 获取当前配送国家可选地区，未知国家返回空列表。 */
export function deliveryRegions(country: string): readonly string[] {
  return DELIVERY_COUNTRIES.some(item => item.code === country) ? DELIVERY_REGIONS[country as DeliveryCountry] : []
}

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
