/** 客服渠道类型；other 允许后台扩展其他联系渠道。 */
export type ContactKind = 'wechat' | 'wechat_official' | 'qq' | 'qq_group' | 'telegram' | 'facebook' | 'x' | 'whatsapp' | 'instagram' | 'other'

export interface ContactChannel {
  id: string
  kind: ContactKind
  name: string
  description: string
  account: string
  qr_image: string
  link: string
  contact_link: string
  primary: boolean
}

export interface ServiceConfig {
  business_time: string
  phone: string
  channels: ContactChannel[]
  wechat_contact_enabled: boolean
  demo: boolean
}
