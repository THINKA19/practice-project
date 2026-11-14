export interface MerchantShop {
  id: string
  merchantId: string
  countryCode?: 'VN' | 'TH' | 'LA' | 'CN'
  currencyCode?: string
  name: string
  soundNotify: boolean
  roleTemplate: 'owner' | 'employee'
  permissions: string[]
  grantVersion: number
}

export interface ShopRequestContext {
  token: string
  shopId: string
  revision: number
}
