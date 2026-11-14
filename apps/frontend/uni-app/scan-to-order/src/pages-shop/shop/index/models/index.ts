/** 营业时段 */
export interface BusinessHour {
  day: string
  open: string
  close: string
  on: boolean
}

export interface TemporaryClosure {
  from?: string
  until: string
  notice: string
}

/** 店铺设置表单 */
export interface ShopSettingsForm {
  shopName: string
  shopLogo: string
  shopPhoto: string
  shopType: string
  contact: string
  address: string
  longitude: number
  latitude: number
  description: string
  /** true 营业中 / false 打烊 */
  businessStatus: boolean
  businessHours: BusinessHour[]
  temporaryClosure?: TemporaryClosure | null
  delivery: boolean
  dineIn: boolean
  takeAway: boolean
  minOrderAmount: number
  deliveryFee: number
  freeDeliveryThreshold: number
  deliveryRadius: number
  notice: string
  autoReceive: boolean
  autoPrint: boolean
  soundNotify: boolean
}
