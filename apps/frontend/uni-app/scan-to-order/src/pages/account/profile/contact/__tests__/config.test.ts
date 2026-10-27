import { expect, it } from 'vitest'
import { parseServiceConfig } from '../models/mappers'

it('拒绝错误配置，空配置不产生虚构号码或渠道', () => {
  expect(() => parseServiceConfig(null)).toThrow()
  expect(() => parseServiceConfig([])).toThrow()
  expect(parseServiceConfig({})).toMatchObject({ phone: '', business_time: '', channels: [], wechat_contact_enabled: false, demo: false })
})
it('兼容旧微信和 QQ 群配置，过滤脚本二维码与无效号码', () => {
  const data = parseServiceConfig({ image: 'javascript:alert(1)', phone: 123, wechat: ' wx ', qq_group: '123456', qq_group_qr: '/static/group.png' })
  expect(data.phone).toBe('')
  expect(data.channels).toHaveLength(2)
  expect(data.channels[0]).toMatchObject({ kind: 'wechat', account: 'wx', qr_image: '' })
  expect(data.channels[1]).toMatchObject({ kind: 'qq_group', account: '123456', qr_image: '/static/group.png' })
})
it('支持多渠道与其他平台，排除空卡片和不安全链接', () => {
  const data = parseServiceConfig({ channels: [null, {}, { kind: 'telegram', account: '@support', qr_image: 'https://cdn.test/tg.png', link: 'https://t.me/support' }, { kind: 'custom', name: '其他客服', account: 'custom', qr_image: 'data:image/svg+xml,invalid', link: 'javascript:alert(1)' }] })
  expect(data.channels).toHaveLength(2)
  expect(data.channels[0]).toMatchObject({ kind: 'telegram', link: 'https://t.me/support' })
  expect(data.channels[1]).toMatchObject({ kind: 'other', name: '其他客服', qr_image: '', link: '' })
})
it('显式空数组不恢复旧渠道，开关只接受布尔值且渠道 id 不碰撞', () => {
  expect(parseServiceConfig({ channels: [], wechat: 'old', wechat_contact_enabled: 'true' }).channels).toEqual([])
  expect(parseServiceConfig({ wechat_contact_enabled: 'true' }).wechat_contact_enabled).toBe(false)
  const data = parseServiceConfig({ phone: '+66 123 45678', channels: [{ id: 'same', account: 'a' }, { id: 'same', account: 'b' }], wechat_contact_enabled: true })
  expect(data.phone).toBe('+66 123 45678')
  expect(data.wechat_contact_enabled).toBe(true)
  expect(new Set(data.channels.map(item => item.id)).size).toBe(2)
})

it('海外渠道保留独立主页、私信链接和推荐设置，隐藏未开通渠道', () => {
  const data = parseServiceConfig({ channels: [
    { kind: 'facebook', account: 'Brand', primary: true, link: 'https://www.facebook.com/brand', contact_link: 'https://m.me/brand' },
    { kind: 'x', account: '@brand', link: 'https://x.com/brand' },
    { kind: 'whatsapp', link: 'https://wa.me/123456789' },
    { kind: 'instagram', link: 'https://www.instagram.com/brand/' },
    { kind: 'other', account: 'not-ready', enabled: false },
  ] })
  expect(data.channels.map(item => item.kind)).toEqual(['facebook', 'x', 'whatsapp', 'instagram'])
  expect(data.channels[0]).toMatchObject({ primary: true, contact_link: 'https://m.me/brand' })
  expect(parseServiceConfig({ channels: [{ kind: 'facebook', contact_link: 'https://m.me/brand' }] }).channels).toHaveLength(1)
})
