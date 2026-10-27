/** 请求与响应的原始契约；展示模型与纯规则在 models/、domain/ 维护。 */

export interface AddressDto {
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
  isDefault?: boolean | number | string
  [k: string]: unknown
}

export interface AddressDetailDto {
  info: AddressDto
  extJson?: Record<string, unknown>
}

export interface AddressFormDto {
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

export interface RegionDto {
  id: string
  name: string
  pid?: string
  level?: number
}
