import type { MapCoordinateType, MapPoint } from '@/utils/project/map-coordinates'

export type H5MapProvider = 'google' | 'amap' | 'tencent'

export interface LocationMarker extends MapPoint {
  id: number
  iconPath: string
  width: number
  height: number
}

export interface LocationMapProps {
  location?: MapPoint | null
  address?: string
  label?: string
  coordinateType?: MapCoordinateType
  countryCode?: string
  markers?: LocationMarker[]
  suspended?: boolean
  provider?: H5MapProvider
}

export interface SdkLocationMapProps {
  location: MapPoint
  label?: string
  coordinateType?: MapCoordinateType
  countryCode?: string
}
