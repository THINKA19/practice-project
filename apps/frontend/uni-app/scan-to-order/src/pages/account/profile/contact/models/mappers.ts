import type { ContactChannel, ContactKind, ServiceConfig } from './types'
import { names } from './enums'

/** 将未知渠道字段收敛为去除首尾空白的文本，不对对象做隐式字符串转换。 */
export const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''

/** 仅保留 HTTP(S) 或本地 static 二维码图片地址，丢弃其他协议。 */
export function imageUrl(value: unknown) {
  const url = text(value)
  return /^https?:\/\//i.test(url) || url.startsWith('/static/') ? url : ''
}

/** 仅保留 HTTP(S) 联系链接，避免将任意协议交给平台打开。 */
export function webUrl(value: unknown) {
  const url = text(value)
  return /^https?:\/\//i.test(url) ? url : ''
}

/** 转换单个已启用的客服渠道，归一化字段；没有可用联系方式时返回 null。 */
export function channel(value: unknown, index: number): ContactChannel | null {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return null
  const row = value as Record<string, unknown>
  if (row.enabled === false)
    return null
  const kind = Object.prototype.hasOwnProperty.call(names, text(row.kind)) ? text(row.kind) as ContactKind : 'other'
  const result: ContactChannel = {
    id: `${text(row.id) || kind}-${index}`,
    kind,
    name: text(row.name) || names[kind],
    description: text(row.description),
    account: text(row.account),
    qr_image: imageUrl(row.qr_image),
    link: webUrl(row.link),
    contact_link: webUrl(row.contact_link),
    primary: row.primary === true,
  }
  return result.account || result.qr_image || result.link || result.contact_link ? result : null
}

/** 校验配置，兼容历史单微信二维码及 QQ 群字段；未配置的渠道不生成空卡片。 */
export function parseServiceConfig(data: unknown): ServiceConfig {
  if (!data || typeof data !== 'object' || Array.isArray(data))
    throw new Error('客服配置无效')
  const source = data as Record<string, unknown>
  const legacy = [
    { kind: 'wechat', account: source.wechat, qr_image: source.image },
    { kind: 'wechat_official', account: source.wechat_official, qr_image: source.wechat_official_qr },
    { kind: 'qq', account: source.qq, qr_image: source.qq_qr },
    { kind: 'qq_group', account: source.qq_group, qr_image: source.qq_group_qr },
    { kind: 'telegram', account: source.telegram, qr_image: source.telegram_qr, link: source.telegram_link },
  ]
  const rows = Array.isArray(source.channels) ? source.channels : legacy
  const phone = text(source.phone)
  return {
    business_time: text(source.business_time),
    phone: /^[+\d][\d -]{4,24}$/.test(phone) ? phone : '',
    channels: rows.map(channel).filter((row): row is ContactChannel => row !== null),
    wechat_contact_enabled: source.wechat_contact_enabled === true,
    demo: source.demo === true,
  }
}
