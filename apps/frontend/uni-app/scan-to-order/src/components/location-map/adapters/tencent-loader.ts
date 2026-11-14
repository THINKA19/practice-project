import type { MapPoint } from '@/utils/project/map-coordinates'

interface TencentMap {
  on: (event: 'tilesloaded', callback: () => void) => void
  setCenter: (center: MapPoint) => void
  setZoom: (zoom: number) => void
  destroy: () => void
}

interface TencentMarkerLayer {
  setMap: (map: TencentMap | null) => void
}

interface TencentApi {
  LatLng: new (latitude: number, longitude: number) => MapPoint
  Map: new (container: HTMLElement, options: { center: MapPoint, zoom: number, pitch: number }) => TencentMap
  MultiMarker: new (options: { map: TencentMap, geometries: { id: string, position: MapPoint }[] }) => TencentMarkerLayer
}

interface TencentWindow extends Window {
  TMap?: TencentApi
}

let pending: Promise<TencentApi> | undefined

export function loadTencentMap(key: string): Promise<TencentApi> {
  if (!key)
    return Promise.reject(new Error('腾讯地图暂未启用'))

  const target = window as TencentWindow
  if (target.TMap?.Map && target.TMap.MultiMarker)
    return Promise.resolve(target.TMap)
  if (pending)
    return pending

  const task = new Promise<TencentApi>((resolve, reject) => {
    const script = document.createElement('script')
    const timeout = setTimeout(() => finish(new Error('地图加载超时')), 20000)

    function finish(error?: Error) {
      clearTimeout(timeout)
      script.onload = null
      script.onerror = null
      const api = target.TMap
      if (!error && api?.Map && api.MultiMarker) {
        resolve(api)
        return
      }
      script.remove()
      reject(error ?? new Error('腾讯地图 SDK 不可用'))
    }

    script.async = true
    script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${encodeURIComponent(key)}`
    script.onload = () => finish()
    script.onerror = () => finish(new Error('地图服务连接失败'))
    document.head.appendChild(script)
  })
  pending = task
  void task.catch(() => {
    if (pending === task)
      pending = undefined
  })
  return task
}
