/** 售后单寄回物流信息（baseInfo.logisticsContent 为 JSON 字符串） */
export interface RefundLogisticsContent {
  linkMan?: string
  mobile?: string
  address?: string
  shipperName?: string
  trackingNumber?: string
  [k: string]: unknown
}
