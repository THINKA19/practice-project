/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / models/map-links.ts
 * 模型层：维护数据契约、展示转换和派生数据，不拥有页面状态。
 * 【方法与导出清单】
 * - googleNavigationUrl：本文件对外声明。
 * - appleNavigationUrl：本文件对外声明。
 * - amapNavigationUrl：本文件对外声明。
 * - baiduNavigationUrl：本文件对外声明。
 * - tencentNavigationUrl：本文件对外声明。
 * - googleEmbedUrl：本文件对外声明。
 * 【综合使用示例】
 * import { googleNavigationUrl } from '@/pages/ordering/index/models/map-links'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
/** 门店外部地图链接；只提供目的地，由地图服务决定路线起点。 */
import type { Shop } from './types'
import { convertShopPoint } from './coordinates'

/** 返回有效的 WGS84 门店坐标；缺失坐标不伪造位置。@param shop 门店。@returns 坐标或 null。@example shopWgsPoint(shop) */
function shopWgsPoint(shop: Shop | null) {
  if (shop?.latitude == null || shop.longitude == null)
    return null
  const latitude = Number(shop.latitude)
  const longitude = Number(shop.longitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180)
    return null
  return convertShopPoint({ latitude, longitude }, shop.coordinateType, 'wgs84', shop.countryCode)
}

/** 生成 Google 导航链接，无 Key 也可使用；无坐标时按完整地址搜索。@param shop 门店。@returns HTTPS 链接或空字符串。@example googleNavigationUrl(shop) */
export function googleNavigationUrl(shop: Shop | null): string {
  if (!shop)
    return ''
  const point = shopWgsPoint(shop)
  const destination = point ? `${point.latitude},${point.longitude}` : shop.address?.trim()
  if (!destination)
    return ''
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&dir_action=navigate`
}

/**
 * 生成 Apple 地图路线链接，坐标统一为 WGS84；无坐标时使用完整地址。
 * @param shop {Shop | null} 当前门店快照。
 * @returns string。
 * @example
 * import { appleNavigationUrl } from '@/pages/ordering/index/models/map-links'
 * declare const shop: Parameters<typeof appleNavigationUrl>[0]
 * appleNavigationUrl(shop) // => string
 */
export function appleNavigationUrl(shop: Shop | null): string {
  if (!shop)
    return ''
  const point = shopWgsPoint(shop)
  const destination = point ? `${point.latitude},${point.longitude}` : shop.address?.trim()
  return destination ? `https://maps.apple.com/?daddr=${encodeURIComponent(destination)}` : ''
}

/**
 * 高德使用经度在前的 GCJ02 坐标；明确境外不施加中国坐标偏移，无坐标按地址搜索。
 * @param shop {Shop | null} 当前门店快照。
 * @returns string。
 * @example
 * import { amapNavigationUrl } from '@/pages/ordering/index/models/map-links'
 * declare const shop: Parameters<typeof amapNavigationUrl>[0]
 * amapNavigationUrl(shop) // => string
 */
export function amapNavigationUrl(shop: Shop | null): string {
  const wgs = shopWgsPoint(shop)
  if (!shop || (!wgs && !shop.address?.trim()))
    return ''
  if (!wgs)
    return `https://uri.amap.com/search?keyword=${encodeURIComponent(shop.address!.trim())}&src=scan-to-order&callnative=1`
  const point = convertShopPoint(wgs, 'wgs84', 'gcj02', shop.countryCode)
  const name = shop.name.replace(/[,|]/g, ' ')
  return `https://uri.amap.com/navigation?to=${encodeURIComponent(`${point.longitude},${point.latitude},${name}`)}&src=scan-to-order&callnative=1`
}

/**
 * 百度显式声明 WGS84，避免把门店坐标误当 BD09；无坐标使用完整地址。
 * @param shop {Shop | null} 当前门店快照。
 * @returns string。
 * @example
 * import { baiduNavigationUrl } from '@/pages/ordering/index/models/map-links'
 * declare const shop: Parameters<typeof baiduNavigationUrl>[0]
 * baiduNavigationUrl(shop) // => string
 */
export function baiduNavigationUrl(shop: Shop | null): string {
  const point = shopWgsPoint(shop)
  if (!shop || (!point && !shop.address?.trim()))
    return ''
  const destination = point ? `latlng:${point.latitude},${point.longitude}|name:${shop.name.replace(/\|/g, ' ')}` : shop.address!.trim()
  return `https://api.map.baidu.com/direction?origin=${encodeURIComponent('我的位置')}&destination=${encodeURIComponent(destination)}&mode=driving&coord_type=wgs84&output=html&src=webapp.scan-to-order`
}

/** 腾讯路线使用纬度在前的 WGS84/GPS 坐标（coord_type=1），无坐标时使用当地地址。@param shop 门店。@returns HTTPS 链接或空字符串。@example tencentNavigationUrl(shop) */
export function tencentNavigationUrl(shop: Shop | null): string {
  const point = shopWgsPoint(shop)
  if (!shop || (!point && !shop.address?.trim()))
    return ''
  const destination = point ? shop.name : shop.address!.trim()
  const coordinate = point ? `&tocoord=${encodeURIComponent(`${point.latitude},${point.longitude}`)}` : ''
  return `https://apis.map.qq.com/uri/v1/routeplan?type=drive&to=${encodeURIComponent(destination)}${coordinate}&coord_type=1&referer=scan-to-order`
}

/** Google Maps 网页嵌入（非 Cloud Embed API），无需 Key 或结算账户；优先 WGS84 坐标，缺坐标按地址展示。@param shop 门店。@returns iframe 地址或空字符串。@example googleEmbedUrl(shop) */
export function googleEmbedUrl(shop: Shop | null): string {
  if (!shop)
    return ''
  const point = shopWgsPoint(shop)
  const query = point ? `${point.latitude},${point.longitude}` : shop.address?.trim()
  return query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed` : ''
}
