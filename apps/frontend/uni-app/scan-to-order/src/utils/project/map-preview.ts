import type { MapCoordinateType, MapPoint } from './map-coordinates'
import { convertMapPoint } from './map-coordinates'

interface MapPlace extends Partial<MapPoint> {
  address?: string
  coordinateType?: MapCoordinateType
  countryCode?: string
}

export function mapWgsPoint(place: MapPlace | null) {
  if (place?.latitude == null || place.longitude == null)
    return null
  const latitude = Number(place.latitude)
  const longitude = Number(place.longitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180)
    return null
  return convertMapPoint({ latitude, longitude }, place.coordinateType, 'wgs84', place.countryCode)
}

/** 生成 Google 地点预览链接，缺少有效坐标时用地址搜索。 */
export function googleEmbedUrl(place: MapPlace | null): string {
  if (!place)
    return ''
  const point = mapWgsPoint(place)
  const query = point ? `${point.latitude},${point.longitude}` : place.address?.trim()
  return query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed` : ''
}
