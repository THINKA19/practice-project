/**
 * ============================================================================
 * 【文件概述】活动发布与时间边界规则；不包含请求、价格计算和页面状态。
 * 【方法与导出清单】parsePromotions、visiblePromotions、promotionState、openingLabel。
 * 【综合使用示例】import { visiblePromotions } from './promotion.rules'; visiblePromotions(shop)
 * ============================================================================
 */
import type { Shop, ShopPromotion } from '../models/types'

/** 日期契约为 YYYY-MM-DD；旧时间戳按当前经营地区 UTC+7 转换，不展示时分。 */
function activityDate(value: unknown): string {
  if (typeof value !== 'string')
    return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const time = Date.parse(value)
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? value : ''
  }
  const time = instant(value)
  return Number.isFinite(time) ? new Date(time + 7 * 3600000).toISOString().slice(0, 10) : ''
}

/** 展示按天的活动日期，跨年保留年份。 */
export function promotionDateRange(activity: Pick<ShopPromotion, 'startsAt' | 'endsAt'>): string {
  const start = activityDate(activity.startsAt)
  const end = activityDate(activity.endsAt)
  const crossYear = start.slice(0, 4) !== end.slice(0, 4)
  const format = (date: string) => `${crossYear ? `${date.slice(0, 4)}年` : ''}${Number(date.slice(5, 7))}月${Number(date.slice(8, 10))}日`
  return `${format(start)}—${format(end)}`
}

/** 活动结束日次日零点，用于列表到期刷新，与按天展示规则一致。 */
export function promotionExpiresAt(activity: Pick<ShopPromotion, 'endsAt'>): number {
  const date = activityDate(activity.endsAt)
  return date ? Date.parse(`${date}T00:00:00+07:00`) + 86400000 : Number.NaN
}

/** 校验具有显式时区的时间。@param value 接口时间。@returns 有效毫秒数或 NaN。@example instant('2026-11-01T00:00:00+07:00') // => 时间戳 */
function instant(value: unknown): number {
  return typeof value === 'string' && /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : Number.NaN
}

/** 校验活动数组，坏记录不参与展示，同 ID 只展示一次。@param value 原始活动数组。@returns 规范化活动。@example parsePromotions(null) // => [] */
export function parsePromotions(value: unknown): ShopPromotion[] {
  if (!Array.isArray(value))
    return []
  const seen = new Set<string>()
  return value.filter((item): item is ShopPromotion => {
    if (!item || typeof item !== 'object')
      return false
    const valid = ['id', 'title', 'rules'].every(key => typeof item[key] === 'string' && !!item[key].trim())
      && ['published', 'draft', 'withdrawn'].includes(item.status)
      && !!activityDate(item.startsAt) && !!activityDate(item.endsAt)
      && activityDate(item.endsAt) >= activityDate(item.startsAt)
    if (!valid || seen.has(item.id))
      return false
    seen.add(item.id)
    return true
  }).map(item => ({ ...item, startsAt: activityDate(item.startsAt), endsAt: activityDate(item.endsAt) }))
}

/** 兼容内部阶段查询，结束日全天有效。@param activity 校验后的活动。@param now 当前毫秒时间。@returns 活动状态。@example promotionState(activity, Date.now()) // => 进行中、即将开始或已结束 */
export function promotionState(activity: ShopPromotion, now = Date.now()): string {
  if (activity.status !== 'published')
    return '已下架'
  if (activityDate(new Date(now).toISOString()) > activityDate(activity.endsAt))
    return '已结束'
  return activityDate(new Date(now).toISOString()) < activityDate(activity.startsAt) ? '即将开始' : '进行中'
}

/** 获取公开且未结束的活动，保持接口顺序，结束日期当天仍可展示。@param shop 门店快照。@param now 当前毫秒时间。@returns 可展示活动。@example visiblePromotions({ promotions: [] }) // => [] */
export function visiblePromotions(shop: Pick<Shop, 'promotions'>, now = Date.now()): ShopPromotion[] {
  const today = activityDate(new Date(now).toISOString())
  return parsePromotions(shop.promotions).filter(item => item.status === 'published' && item.endsAt >= today)
}

/** 门店状态独立于活动，新店标识有到期时间。@param shop 门店快照。@param now 当前毫秒时间。@returns 开业标签或空字符串。@example openingLabel({ openingState: 'upcoming' }) // => 即将开业 */
export function openingLabel(shop: Pick<Shop, 'openingState' | 'newUntil'>, now = Date.now()): string {
  if (shop.openingState === 'upcoming')
    return '即将开业'
  return shop.openingState === 'new' && instant(shop.newUntil) > now ? '新开业' : ''
}
