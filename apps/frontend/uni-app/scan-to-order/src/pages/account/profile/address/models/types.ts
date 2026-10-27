import type { PHONE_COUNTRIES } from './enums'

export interface Region {
  id: string
  name: string
  pid?: string
  level?: number
}

export interface Address {
  id: number
  linkMan: string
  mobile: string
  phoneCountry?: string
  countryCode?: string
  regionText?: string
  address: string
  provinceId?: string
  cityId?: string
  districtId?: string
  provinceStr?: string
  cityStr?: string
  areaStr?: string
  latitude?: number
  longitude?: number
  isDefault?: boolean
  [k: string]: unknown
}

export interface AddressDetail {
  info: Address
  extJson?: Record<string, unknown>
}

export interface AddressForm {
  id?: number
  linkMan: string
  mobile: string
  phoneCountry?: string
  countryCode?: string
  regionText?: string
  address: string
  provinceId?: string
  cityId?: string
  districtId?: string
  latitude?: number
  longitude?: number
  isDefault?: boolean
}

/** 编辑中的地址字段 */
export interface AddressDraft {
  linkMan: string
  mobile: string
  phoneCountry: string
  countryCode: string
  regionText: string
  address: string
  latitude?: number
  longitude?: number
  isDefault?: boolean
}

export type PhoneCountry = typeof PHONE_COUNTRIES[number]['code']

export type DeliveryCountry = Exclude<PhoneCountry, 'CN'> | 'MY'
