import { describe, expect, it } from 'vitest'
import { fullAddress, internationalPhone, validateAddress } from '../domain/address.rules'
import { DELIVERY_COUNTRIES } from '../models/enums'

describe('东南亚收货地址', () => {
  const form = { linkMan: '顾客', mobile: '0912345678', phoneCountry: 'VN', countryCode: 'VN', regionText: '胡志明市', address: '一号街' }
  it('五国手机号支持本地和国际格式，拒绝区号不匹配', () => {
    for (const [country, local, international] of [
      ['CN', '13800000000', '+8613800000000'],
      ['VN', '0912345678', '+84912345678'],
      ['LA', '02012345678', '+8562012345678'],
      ['TH', '0812345678', '+66812345678'],
      ['ID', '081234567890', '+6281234567890'],
    ]) {
      expect(internationalPhone(local, country)).toBe(international)
      expect(internationalPhone(international, country)).toBe(international)
    }
    expect(internationalPhone('+8613800000000', 'VN')).toBeNull()
    expect(internationalPhone('123', 'VN')).toBeNull()
    expect(internationalPhone('0912abc678', 'VN')).toBeNull()
  })
  it('不要求地图坐标或三级行政区，中国不在配送范围', () => {
    expect(validateAddress(form)).toBeNull()
    expect(DELIVERY_COUNTRIES.some(item => String(item.code) === 'CN')).toBe(false)
    expect(validateAddress({ ...form, countryCode: 'CN' })).toContain('countryPlaceholder')
    expect(validateAddress({ ...form, regionText: '' })).toContain('regionPlaceholder')
    expect(validateAddress({ ...form, countryCode: 'TH' })).toContain('regionPlaceholder')
    expect(validateAddress({ ...form, countryCode: 'MY', regionText: '吉隆坡' })).toBeNull()
    expect(fullAddress(form)).toBe('越南 · 胡志明市 · 一号街')
  })
})
