import type { ContactKind } from './types'

export const names: Record<ContactKind, string> = {
  wechat: '客服微信',
  wechat_official: '微信公众号',
  qq: 'QQ 客服',
  qq_group: '客服 QQ 群',
  telegram: 'Telegram',
  facebook: 'Facebook',
  x: 'X（Twitter）',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  other: '其他联系方式',
}
