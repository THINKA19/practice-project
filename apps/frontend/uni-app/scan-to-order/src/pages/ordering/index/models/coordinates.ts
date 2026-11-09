/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / models/coordinates.ts
 * 模型层：维护数据契约、展示转换和派生数据，不拥有页面状态。
 * 【方法与导出清单】
 * - convertShopPoint：本文件对外声明。
 * 【综合使用示例】
 * import { convertShopPoint } from '@/pages/ordering/index/models/coordinates'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
/** 门店地图坐标转换；OSM 使用 WGS84，原生地图使用 GCJ02。 */
interface Point { latitude: number, longitude: number }

function offset(point: Point): Point {
  const { latitude, longitude } = point
  // GCJ02 在境外不加偏移。
  if (longitude < 72.004 || longitude > 137.8347 || latitude < 0.8293 || latitude > 55.8271)
    return { latitude: 0, longitude: 0 }
  const x = longitude - 105
  const y = latitude - 35
  const pi = Math.PI
  const common = (20 * Math.sin(6 * x * pi) + 20 * Math.sin(2 * x * pi)) * 2 / 3
  let lat = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x)) + common
  lat += (20 * Math.sin(y * pi) + 40 * Math.sin(y / 3 * pi)) * 2 / 3
  lat += (160 * Math.sin(y / 12 * pi) + 320 * Math.sin(y * pi / 30)) * 2 / 3
  let lng = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x)) + common
  lng += (20 * Math.sin(x * pi) + 40 * Math.sin(x / 3 * pi)) * 2 / 3
  lng += (150 * Math.sin(x / 12 * pi) + 300 * Math.sin(x / 30 * pi)) * 2 / 3
  const rad = latitude / 180 * pi
  const magic = 1 - 0.006693421622965943 * Math.sin(rad) ** 2
  return {
    latitude: lat * 180 / ((6378245 * (1 - 0.006693421622965943)) / (magic * Math.sqrt(magic)) * pi),
    longitude: lng * 180 / (6378245 / Math.sqrt(magic) * Math.cos(rad) * pi),
  }
}

/** 转换门店坐标，不修改源对象；未声明沿用历史 GCJ02 约定。@param point 坐标。@param source 来源坐标系。@param target 目标坐标系。@param countryCode 门店国家代码，明确境外时不加中国坐标偏移。@returns 转换坐标（近似转换，不用于测绘）。@example convertShopPoint(point, 'wgs84', 'gcj02', 'CN') */
export function convertShopPoint(point: Point, source: 'gcj02' | 'wgs84' = 'gcj02', target: 'gcj02' | 'wgs84' = 'wgs84', countryCode?: string): Point {
  if (source === target || (countryCode && countryCode !== 'CN'))
    return { ...point }
  if (target === 'gcj02') {
    const delta = offset(point)
    return { latitude: point.latitude + delta.latitude, longitude: point.longitude + delta.longitude }
  }
  let result = { ...point }
  for (let i = 0; i < 5; i++) {
    const delta = offset(result)
    result = { latitude: point.latitude - delta.latitude, longitude: point.longitude - delta.longitude }
  }
  return result
}
