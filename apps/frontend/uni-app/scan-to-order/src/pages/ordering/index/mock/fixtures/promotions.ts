/**
 * ============================================================================
 * 【文件概述】活动测试数据工厂，业务字段与正式协议一致；相对时间只用于开发样本。
 * 【方法与导出清单】promotion、openingDate、newUntil：生成活动与开业时间。
 * 【综合使用示例】import { promotion } from './promotions'; promotion('shop-1', 'opening')
 * ============================================================================
 */
import type { ShopPromotion } from '../../models/types'

const day = 86400000
const now = Date.now()
/** 生成业务时区日期。@param time 毫秒时间。@returns UTC+7 日期。@example date(now) // => YYYY-MM-DD */
function date(time: number) {
  return new Date(time + 7 * 3600000).toISOString().slice(0, 10)
}
/** 新店标识到期时间；仅 Mock 相对日期。@example newUntil // => ISO 时间 */
export const newUntil = new Date(now + 7 * day).toISOString()
/** 筹备门店预计日期；仅 Mock 相对日期。@example openingDate // => YYYY-MM-DD */
export const openingDate = date(now + 3 * day)

/** 生成完整活动样本。@param id 独立活动 ID。@param kind 活动场景。@returns 发布和时间字段完整的活动。@example promotion('a', 'upcoming') // => 即将开始的开业优惠 */
export function promotion(id: string, kind: 'opening' | 'set' | 'upcoming' | 'expired' | 'draft' | 'withdrawn'): ShopPromotion {
  const future = kind === 'upcoming'
  const startsAt = now + (future ? 3 : kind === 'expired' ? -7 : -1) * day
  const endsAt = now + (future ? 6 : kind === 'expired' ? -1 : 6) * day
  const opening = kind === 'opening' || future
  return {
    id,
    status: kind === 'draft' || kind === 'withdrawn' ? kind : 'published',
    startsAt: date(startsAt),
    endsAt: date(endsAt),
    title: opening ? '开业招牌双人套餐八折' : '招牌双人套餐享八五折',
    rules: '仅限招牌双人套餐，每单限享一次。不可与其他套餐折扣同享。\n支持堂食、到店自取，活动期间按门店实际供应提供。',
  }
}
