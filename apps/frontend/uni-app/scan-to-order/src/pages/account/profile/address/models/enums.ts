import type { DeliveryCountry } from './types'

/** 电话国家与配送国家分别配置；中国电话可用，中国地址不在配送范围。 */
export const PHONE_COUNTRIES = [
  { code: 'CN', name: '中国', dial: '86', min: 11, max: 11 },
  { code: 'VN', name: '越南', dial: '84', min: 9, max: 9 },
  { code: 'LA', name: '老挝', dial: '856', min: 10, max: 10 },
  { code: 'TH', name: '泰国', dial: '66', min: 9, max: 9 },
  { code: 'ID', name: '印度尼西亚', dial: '62', min: 9, max: 12 },
] as const

export const DELIVERY_COUNTRIES: { code: DeliveryCountry, name: string }[] = [
  { code: 'VN', name: '越南' },
  { code: 'LA', name: '老挝' },
  { code: 'TH', name: '泰国' },
  { code: 'ID', name: '印度尼西亚' },
  { code: 'MY', name: '马来西亚' },
]

/** 当前提供的省／城市选项，由业务维护，不代表全国地址全集。 */
export const DELIVERY_REGIONS: Record<DeliveryCountry, readonly string[]> = {
  VN: ['河内市', '胡志明市', '岘港市', '海防市', '顺化市', '芹苴市'],
  LA: ['万象市', '琅勃拉邦省', '占巴塞省'],
  TH: ['曼谷', '清迈府', '普吉府', '春武里府'],
  ID: ['雅加达', '巴厘省', '东爪哇省'],
  MY: ['吉隆坡', '雪兰莪州', '槟城州', '柔佛州'],
}
