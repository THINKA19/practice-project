export interface AmapInstance {
  add: (marker: unknown) => void
  on: (event: string, callback: () => void) => void
  setZoomAndCenter: (zoom: number, center: number[]) => void
  destroy: () => void
}

export interface AmapApi {
  Map: new (container: HTMLElement, options: { center: number[], zoom: number, lang: string }) => AmapInstance
  Marker: new (options: { position: number[], title: string }) => unknown
}

interface AmapWindow extends Window {
  AMap?: AmapApi
  _AMapSecurityConfig?: { securityJsCode: string }
}

let pending: Promise<AmapApi> | undefined
let sequence = 0

export function loadAmap(key: string, securityJsCode: string): Promise<AmapApi> {
  if (!key.trim() || !securityJsCode.trim())
    return Promise.reject(new Error('地图暂未启用'))
  const target = window as AmapWindow
  if (target.AMap)
    return Promise.resolve(target.AMap)
  if (pending)
    return pending
  target._AMapSecurityConfig = { securityJsCode }
  const callback = `__locationMapAmapReady${++sequence}`
  const callbacks = window as unknown as Record<string, unknown>
  const task = new Promise<AmapApi>((resolve, reject) => {
    const script = document.createElement('script')
    const timeout = setTimeout(() => finish(new Error('地图加载超时')), 20000)
    function finish(error?: Error) {
      clearTimeout(timeout)
      script.onerror = null
      delete callbacks[callback]
      if (error) {
        script.remove()
        reject(error)
      }
      else if (target.AMap) {
        resolve(target.AMap)
      }
      else {
        script.remove()
        reject(new Error('地图暂时无法加载'))
      }
    }
    callbacks[callback] = () => finish()
    script.async = true
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}&callback=${callback}`
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
