/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / adapters/amap-loader.ts
 * 适配层：衔接现有导航、平台能力和错误协议。
 * 【方法与导出清单】
 * - AmapInstance：数据类型契约。
 * - AmapApi：数据类型契约。
 * - loadAmap：本文件对外声明。
 * 【综合使用示例】
 * import type { AmapInstance } from '@/pages/ordering/index/adapters/amap-loader'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/**
 * H5 门店地图 SDK 接入；按高德官方异步回调协议加载，失败可重试。
 * 结构字段：add、on、setZoomAndCenter、destroy；必填与可选字段见声明。
 * @example
 * import type { AmapInstance } from '@/pages/ordering/index/adapters/amap-loader'
 * declare const response: AmapInstance
 * const value: AmapInstance = response // => 保留 AmapInstance 的字段与取值约束
 */
export interface AmapInstance {
  add: (marker: unknown) => void
  on: (event: string, callback: () => void) => void
  setZoomAndCenter: (zoom: number, center: number[]) => void
  destroy: () => void
}

/**
 * AmapApi 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：Map、Marker；必填与可选字段见声明。
 * @example
 * import type { AmapApi } from '@/pages/ordering/index/adapters/amap-loader'
 * declare const response: AmapApi
 * const value: AmapApi = response // => 保留 AmapApi 的字段与取值约束
 */
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

/**
 * 同一页面共享 SDK；未配置不请求，不在原生端调用。
 * @param key {string} 服务端购物车条目标识。
 * @param securityJsCode {string} 高德 JS SDK 安全码；由项目环境配置提供。
 * @returns Promise<AmapApi>。
 * @example
 * import { loadAmap } from '@/pages/ordering/index/adapters/amap-loader'
 * declare const key: Parameters<typeof loadAmap>[0]
 * declare const securityJsCode: Parameters<typeof loadAmap>[1]
 * loadAmap(key, securityJsCode) // => Promise<AmapApi>
 */
export function loadAmap(key: string, securityJsCode: string): Promise<AmapApi> {
  if (!key.trim() || !securityJsCode.trim())
    return Promise.reject(new Error('地图暂未启用'))
  const target = window as AmapWindow
  if (target.AMap)
    return Promise.resolve(target.AMap)
  if (pending)
    return pending
  target._AMapSecurityConfig = { securityJsCode }
  const callback = `__orderingAmapReady${++sequence}`
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
