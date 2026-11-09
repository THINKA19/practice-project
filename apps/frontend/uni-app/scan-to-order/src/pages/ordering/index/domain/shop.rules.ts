/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / domain/shop.rules.ts
 * 规则层：维护不依赖页面生命周期的纯业务规则。
 * 【方法与导出清单】
 * - isShopOpened：本文件对外声明。
 * - parseScanScene：本文件对外声明。
 * - distanceLine：本文件对外声明。
 * - formatDistance：本文件对外声明。
 * 【综合使用示例】
 * import { isShopOpened } from '@/pages/ordering/index/domain/shop.rules'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { ScanDining, Shop } from '../models/types'

/** 明确经营状态优先，兼容旧版筹备门店；不从新开业标签推断经营状态。 */
export function shopBusinessState(shop: Pick<Shop, 'businessState' | 'openingState' | 'openingHours'>, now = Date.now()) {
  if (shop.businessState && shop.businessState !== 'open')
    return shop.businessState
  if (!shop.businessState && shop.openingState === 'upcoming')
    return 'upcoming'
  const range = shop.openingHours?.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/)
  if (!range)
    return shop.businessState
  const [sh, sm, eh, em] = range.slice(1).map(Number)
  if (sh > 23 || sm > 59 || eh > 24 || em > 59 || (eh === 24 && em !== 0))
    return shop.businessState
  // 当前经营地区使用 UTC+7，与活动日期保持一致，不依赖顾客设备时区。
  const date = new Date(now + 7 * 3600000)
  const minute = date.getUTCHours() * 60 + date.getUTCMinutes()
  const start = sh * 60 + sm
  const end = eh * 60 + em
  return (start === end || (start < end ? minute >= start && minute < end : minute >= start || minute < end)) ? 'open' : 'resting'
}

/** 经营状态仅作说明，不充当优惠入口。 */
export function shopBusinessLabel(shop: Pick<Shop, 'businessState' | 'openingState' | 'openingHours'>, now = Date.now()): string {
  const state = shopBusinessState(shop, now)
  return state ? { open: '正常营业', upcoming: '即将开业', suspended: '暂停营业', resting: '休息中' }[state] : ''
}

/** 可浏览及加购，只有明确营业时才允许结算。 */
export function shopCheckoutReason(shop: Pick<Shop, 'businessState' | 'openingState' | 'openingHours'> | null, now = Date.now()): string {
  if (!shop)
    return '请先进入门店'
  const state = shopBusinessState(shop, now)
  if (state === 'open')
    return ''
  return state ? `${shopBusinessLabel(shop, now)}，暂不可结算` : '门店营业状态待确认，暂不可结算'
}

/** 兼容旧调用方；经营状态不限制进入浏览。 */
export function shopBusinessUnavailable(shop: Pick<Shop, 'businessState' | 'openingState' | 'openingHours'>): boolean {
  return !!shopCheckoutReason(shop)
}
/**
 * 门店上下文 - 领域模型与规则
 */
function hmToMinutes(value: string) {
  const parts = value.trim().split(':')

  return parts.length === 2 && parts.every(p => p.trim() !== '' && Number.isFinite(Number(p))) ? Number(parts[0]) * 60 + Number(parts[1]) : Number.NaN
}

/**
 * 是否营业中（原 checkIsOpened，修正为纯函数，支持跨天）
 * 未配置营业时间视为营业
 * @param openingHours {string | undefined | null} 营业时段文本，支持跨日。
 * @param now {Date} 本次计算使用的时间。
 * @returns boolean。
 * @example
 * import { isShopOpened } from '@/pages/ordering/index/domain/shop.rules'
 * declare const openingHours: Parameters<typeof isShopOpened>[0]
 * isShopOpened(openingHours) // => boolean
 */
export function isShopOpened(openingHours: string | undefined | null, now: Date = new Date()): boolean {
  if (!openingHours) {
    return true
  }

  const [start, end] = openingHours.split('-')

  if (!start || !end) {
    return true
  }

  const s = hmToMinutes(start)

  const e = hmToMinutes(end)

  if (Number.isNaN(s) || Number.isNaN(e)) {
    return true
  }

  const cur = now.getHours() * 60 + now.getMinutes()

  if (s > e) {
    // 跨天营业

    return cur > s || cur < e
  }

  return s < cur && cur < e
}

/**
 * 解析扫码点餐 scene
 * 支持 "shopId=36,id=111,key=Y6RoIT" 与 "1007292,1015,zsT1U3" 两种格式
 * 返回 null 表示不是扫码点餐
 * @param rawScene {string | null} URL 编码的扫码桌台参数。
 * @returns ScanDining | null。
 * @example
 * import { parseScanScene } from '@/pages/ordering/index/domain/shop.rules'
 * parseScanScene() // => ScanDining | null
 */
export function parseScanScene(rawScene?: string | null): ScanDining | null {
  if (!rawScene) {
    return null
  }

  const scene = decodeURIComponent(rawScene)

  const parts = scene.split(',')

  if (parts.length !== 3) {
    return null
  }

  if (scene.includes('key=')) {
    const map: Record<string, string> = {}

    parts.forEach((p) => {
      const [k, v] = p.split('=')

      map[k] = v
    })

    if (!map.shopId || !map.id || !map.key) {
      return null
    }

    return { shopId: map.shopId, id: map.id, key: map.key }
  }

  return { shopId: parts[0], id: parts[1], key: parts[2] }
}

/**
 * 两点直线距离（米），原 pay/index.js getDistanceLine（球面距离，地球半径 6378137）
 * @param lat1 {number} 起点纬度。
 * @param lng1 {number} 起点经度。
 * @param lat2 {number} 终点纬度。
 * @param lng2 {number} 终点经度。
 * @returns number。
 * @example
 * import { distanceLine } from '@/pages/ordering/index/domain/shop.rules'
 * declare const lat1: Parameters<typeof distanceLine>[0]
 * declare const lng1: Parameters<typeof distanceLine>[1]
 * declare const lat2: Parameters<typeof distanceLine>[2]
 * declare const lng2: Parameters<typeof distanceLine>[3]
 * distanceLine(lat1, lng1, lat2, lng2) // => number
 */
export function distanceLine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRadians = (d: number) => d * Math.PI / 180

  const radLat1 = toRadians(lat1)

  const radLat2 = toRadians(lat2)

  const deltaLat = radLat1 - radLat2

  const deltaLng = toRadians(lng1) - toRadians(lng2)

  const dis = 2 * Math.asin(Math.sqrt(
    Math.sin(deltaLat / 2) ** 2 + Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLng / 2) ** 2,
  ))

  return dis * 6378137
}

/**
 * 距离展示（保留 1 位小数）
 * @param distance {number | string} 配送距离或距离展示值，单位千米。
 * @returns string。
 * @example
 * import { formatDistance } from '@/pages/ordering/index/domain/shop.rules'
 * formatDistance() // => string
 */
export function formatDistance(distance?: number | string): string {
  const n = Number(distance)

  return Number.isFinite(n) ? n.toFixed(1) : ''
}
