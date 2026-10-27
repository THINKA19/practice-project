/** 仅开发环境的礼品卡演示；兑换码 GIFT-DEMO，不产生真实资产。 */
import { defineMock } from '@alova/mock'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import type { MyCard } from '../models/types'
import { endpoints } from '../api/endpoints'

const templates = [
  { id: 1, name: '心意储值礼品卡', amount: 100, price: 100, pic: '/static/images/gift-card/classic.png' },
  { id: 2, name: '茶饮欢享礼品卡', amount: 50, price: 50, pic: '/static/images/gift-card/tea.png' },
  { id: 3, name: '咖啡时光礼品卡', amount: 80, price: 80, pic: '/static/images/gift-card/coffee.png' },
  { id: 4, name: '相聚庆祝礼品卡', amount: 200, price: 200, pic: '/static/images/gift-card/celebrate.png' },
]
const template = templates[0]
const accounts = new Map<string, MyCard[]>()
const redeemed = new Set<string>()
const shares = new Map<string, { owner: string, card: MyCard, remark: string, expires: number }>()
let serial = 1
function owner(authorization: unknown) {
  if (!/^Bearer wx-demo-session-\S+$/.test(String(authorization)))
    throw new Error('请先登录顾客账户')
  return mockCustomerOwner(authorization)
}
function cards(account: string) {
  if (!accounts.has(account))
    accounts.set(account, [])
  return accounts.get(account)!
}
export function reset() {
  accounts.clear()
  redeemed.clear()
  shares.clear()
  serial = 1
}
export default defineMock({
  [`[GET]${endpoints.list}`]: withFailure(() => ok(templates.map(item => ({ ...item })))),
  [`[GET]${endpoints.my}`]: withFailure(({ headers }) => ok(cards(owner(headers.Authorization)).map(card => ({ ...card })))),
  [`[POST]${endpoints.logs}`]: withFailure(({ headers, data }) => {
    const card = cards(owner(headers.Authorization)).find(item => item.id === Number((data as { cardId?: unknown }).cardId))
    return card ? ok({ result: [], totalPage: 0 }) : fail('卡片不存在')
  }),
  [`[POST]${endpoints.exchange}`]: withFailure(({ headers, data }) => {
    const account = owner(headers.Authorization)
    if ((data as { number?: unknown }).number !== 'GIFT-DEMO')
      return fail('演示兑换码为 GIFT-DEMO')
    if (redeemed.has(account))
      return fail('本账户已使用该演示兑换码')
    cards(account).push({ id: serial++, cardId: template.id, cardInfo: template, amount: 100, status: 0, type: 1, isActive: false })
    redeemed.add(account)
    return ok(null)
  }, { write: true }),
  [`[POST]${endpoints.shareOpen}`]: withFailure(({ headers, data }) => {
    const account = owner(headers.Authorization)
    const input = data as { id?: unknown, remark?: unknown }
    const card = cards(account).find(item => item.id === Number(input.id))
    if (!card || card.isActive || card.fromUid)
      return fail('卡片不可赠送')
    if (card.shareToken)
      shares.delete(card.shareToken)
    const token = `demo-gift-${serial++}`
    card.shareToken = token
    shares.set(token, { owner: account, card, remark: String(input.remark || ''), expires: Date.now() + 86400000 })
    return ok(token)
  }, { write: true }),
  [`[POST]${endpoints.shareClose}`]: withFailure(({ headers, data }) => {
    const card = cards(owner(headers.Authorization)).find(item => item.id === Number((data as { id?: unknown }).id))
    if (!card)
      return fail('卡片不存在')
    if (card.shareToken)
      shares.delete(card.shareToken)
    card.shareToken = ''
    return ok(null)
  }, { write: true }),
  [`[POST]${endpoints.shareFetch}`]: withFailure(({ headers, data }) => {
    const account = owner(headers.Authorization)
    const input = data as { id?: unknown, shareToken?: string, calculate?: boolean }
    const share = shares.get(input.shareToken || '')
    if (!share || share.expires < Date.now() || share.card.id !== Number(input.id))
      return fail('分享已失效或被领取')
    const result = { user: { nick: '演示赠送人' }, cardUser: { ...share.card }, cardInfo: { ...template, shareContent: share.remark } }
    if (input.calculate === true)
      return ok(result)
    if (share.owner === account)
      return fail('不能领取自己的赠送')
    const source = cards(share.owner)
    source.splice(source.indexOf(share.card), 1)
    cards(account).push({ ...share.card, shareToken: '', isActive: true, fromUid: 1 })
    shares.delete(input.shareToken!)
    return ok(result)
  }, { write: true }),
})
