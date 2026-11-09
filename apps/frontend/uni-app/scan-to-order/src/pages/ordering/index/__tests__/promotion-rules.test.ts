/** 活动发布、时间、异常数据和新店标签到期回归。 */
import { expect, it } from 'vitest'
import { openingLabel, parsePromotions, promotionDateRange, promotionExpiresAt, promotionState, visiblePromotions } from '../domain/promotion.rules'
import type { ShopPromotion } from '../models/types'

const now = Date.parse('2026-11-01T10:00:00+07:00')
const base: ShopPromotion = { id: 'a', status: 'published', startsAt: '2026-11-01', endsAt: '2026-11-01', applicableModes: ['堂食'], title: '套餐优惠', summary: '双人套餐八折', period: '11月1日 09:00 至 11:00', rules: '不可叠加其他优惠' }

it('卡片日期使用业务时区，省略时分并保留跨年年份', () => {
  expect(promotionDateRange(base)).toBe('11月1日—11月1日')
  expect(promotionDateRange({ startsAt: '2026-10-31T18:00:00Z', endsAt: '2026-11-07T16:34:00+07:00' })).toBe('11月1日—11月7日')
  expect(promotionDateRange({ startsAt: '2026-12-31T00:00:00+07:00', endsAt: '2027-01-02T00:00:00+07:00' })).toBe('2026年12月31日—2027年1月2日')
})

it('公开未结束活动才能展示，即将开始可预览，草稿和撤回不可见', () => {
  const future = { ...base, id: 'b', startsAt: '2026-11-02', endsAt: '2026-11-07' }
  const ended = { ...base, id: 'c', startsAt: '2026-10-30', endsAt: '2026-10-31' }
  expect(visiblePromotions({ promotions: [future, ended, { ...base, id: 'd', status: 'draft' }, { ...base, id: 'e', status: 'withdrawn' }, base] }, now).map(item => item.id)).toEqual(['b', 'a'])
  expect(promotionState(future, now)).toBe('即将开始')
  expect(promotionState(base, now)).toBe('进行中')
  expect(promotionState(ended, now)).toBe('已结束')
  expect(promotionState({ ...base, status: 'withdrawn' }, now)).toBe('已下架')
})

it('校验日期、倒置范围和重复编号，单日活动不需要适用方式及完整时刻', () => {
  expect(parsePromotions([null, {}, { ...base, startsAt: '2026-11-01T09:00:00' }, { ...base, endsAt: '2026-10-31' }, { ...base, startsAt: '2026-02-30' }, base, base])).toEqual([base])
  expect(parsePromotions('bad')).toEqual([])
})

it('新开业必须有未到期的标识，门店状态不由优惠状态推断', () => {
  expect(openingLabel({ openingState: 'new', newUntil: '2026-11-02T00:00:00+07:00' }, now)).toBe('新开业')
  expect(openingLabel({ openingState: 'new', newUntil: '2026-10-31T00:00:00+07:00' }, now)).toBe('')
  expect(openingLabel({ openingState: 'new' }, now)).toBe('')
  expect(openingLabel({ openingState: 'upcoming' }, now)).toBe('即将开业')
})

it('结束日整天有效，次日隐藏；日期接口不要求旧展示字段', () => {
  const simple = { id: 'simple', status: 'published' as const, startsAt: '2026-11-01', endsAt: '2026-11-01', title: '优惠', summary: '套餐优惠', rules: '到店参与' }
  expect(visiblePromotions({ promotions: [simple] }, Date.parse('2026-11-01T23:59:59+07:00'))).toHaveLength(1)
  expect(visiblePromotions({ promotions: [simple] }, Date.parse('2026-11-02T00:00:00+07:00'))).toHaveLength(0)
  expect(promotionExpiresAt(simple)).toBe(Date.parse('2026-11-02T00:00:00+07:00'))
})
