/**
 * ============================================================================
 * 【文件概述】ordering 页面使用的导航适配；正常跳转复用已有 navigate，特殊跳转复用 uni API。
 * 【方法与导出清单】buildUrl、redirect、relaunch、openLink。
 * 【综合使用示例】import { buildUrl } from './navigation.adapter'; buildUrl('/pages/ordering/menu-search/index', { categoryId: 1 })
 * ============================================================================
 */
import type { NavigationQuery } from '@/utils/project/navigation'
import { navigate } from '@/utils/project/navigation'

/** 编码业务提供的页面路径。@param path 目标路径。@param query 查询值。@returns 编码地址。@example buildUrl('/pages/a', { id: 1 }) // /pages/a?id=1 */
export function buildUrl(path: string, query: NavigationQuery = {}): string {
  const params = Object.entries(query).filter(([,v]) => v !== undefined && v !== null).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
  return params ? path + (path.includes('?') ? '&' : '?') + params : path
}
/** 替换当前页面。@param path 页面路径。@param query 参数。@returns void。@example redirect('/pages/a', { id: 1 }) */
export function redirect(path: string, query?: NavigationQuery): void {
  uni.redirectTo({ url: buildUrl(path, query) })
}
/** 重启页面栈。@param path 页面路径。@param query 参数。@returns void。@example relaunch('/pages/a') */
export function relaunch(path: string, query?: NavigationQuery): void {
  uni.reLaunch({ url: buildUrl(path, query) })
}
/** 打开调用方提供的链接。@param path 内部页面或 HTTPS 链接。@returns void。@example openLink('/pages/a') */
export function openLink(path?: string): void {
  if (!path)
    return
  if (path.startsWith('/pages/')) {
    void navigate(path)
    return
  }
  // #ifdef H5
  if (/^https:\/\//i.test(path)) {
    window.open(path, '_blank', 'noopener,noreferrer')
    return
  }
  // #endif
  uni.showToast({ title: '当前平台无法打开此链接', icon: 'none' })
}
