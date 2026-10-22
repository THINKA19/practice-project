import { tabBar } from '@/tabbar/config'

/** 项目新增导航工具；业务路由和返回兜底由调用方提供。 */
export const TAB_ROUTES: string[] = (tabBar?.list ?? []).map(item => normalizePath(item.pagePath))

/** 路由传参标准结构类型 */
type Query = Record<string, string | number | boolean | undefined | null>

/**
 * 构造带查询参数的完整 URL 地址
 * 自动剔除 undefined、null 及空字符串，并对参数值进行 encodeURIComponent 编码
 *
 * @param path 目标路径（如 '/pages/home/index' 或已带参路径）
 * @param query 参数键值对对象
 * @returns 拼接并编码后的完整 URL
 *
 * @example
 * buildUrl('/pages/order/detail', { id: 123, source: 'share', emptyVal: null })
 * // => '/pages/order/detail?id=123&source=share'
 */
export function buildUrl(path: string, query?: Query): string {
  if (!query) {
    return path
  }
  const qs = Object.keys(query)
    .filter(k => query[k] !== undefined && query[k] !== null && query[k] !== '')
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(String(query[k]))}`)
    .join('&')
  return qs ? `${path}${path.includes('?') ? '&' : '?'}${qs}` : path
}

/**
 * 校验指定路径是否为底部 Tab 页面
 * 忽略可能附带的 query 参数，并标准化斜杠比对
 *
 * @param url 待检查的目标路径
 * @returns 是否属于 TAB_ROUTES
 *
 * @example
 * isTabRoute('/pages/home/index/index?from=user') // => true
 * isTabRoute('/pages/account/orders/all-orders/index') // => false
 */
export function isTabRoute(url: string): boolean {
  return TAB_ROUTES.includes(normalizePath(url))
}

/**
 * 智能跳转（项目最常用导航入口）
 * 内部自动判断：目标若为 Tab 页则走 switchTab（截断 query），非 Tab 页走 navigateTo
 *
 * @param path 目标路由路径
 * @param query 可选的路由查询参数对象
 *
 * @example
 * // 1. 普通非 Tab 页面跳转带参
 * go(targetPath, { goodsId: 'G1002' })
 *
 * // 2. 目标为 Tab 页，自动切换为 switchTab 方式
 * go(targetPath)
 */
export function go(path: string, query?: Query): void {
  const url = buildUrl(path.startsWith('/') ? path : `/${path}`, query)
  if (isTabRoute(url)) {
    switchTab(url)
    return
  }
  uni.navigateTo({ url })
}

/**
 * 规范化路由路径格式
 * 去除末尾查询参数，并强制补齐前导斜杠 '/'
 *
 * @param url 待处理的原始路径字符串
 * @returns 规范化后的绝对路径
 *
 * @example
 * normalizePath('pages/home/index/index?tab=1') // => '/pages/home/index/index'
 */
export function normalizePath(url: string): string {
  return `/${url.split(/[?#]/)[0].replace(/^\//, '')}`
}

/**
 * 获取当前展示页面的标准规范化路由
 * 若当前无页面栈（极端冷启动），则返回空字符串
 *
 * @returns 当前页面路由，例如 '/pages/home/index/index'
 *
 * @example
 * const current = currentRoute()
 * if (current === targetPath) { ... }
 */
export function currentRoute(): string {
  const pages = getCurrentPages()
  const route = pages[pages.length - 1]?.route
  return route ? normalizePath(route) : ''
}

/**
 * 显式切换至底部 Tab 页面
 *
 * @param path Tab 页面标准路径
 *
 * @example
 * switchTab(targetPath)
 */
export function switchTab(path: string): void {
  uni.switchTab({ url: normalizePath(path) })
}

/**
 * 重定向跳转（关闭当前页面并跳转到应用内的某个页面）
 *
 * @param path 目标路由路径
 * @param query 可选的路由查询参数对象
 *
 * @example
 * redirect(targetPath, { redirectFrom: 'orderDetail' })
 */
export function redirect(path: string, query?: Query): void {
  if (isTabRoute(path)) {
    switchTab(path)
    return
  }
  uni.redirectTo({ url: buildUrl(path.startsWith('/') ? path : `/${path}`, query) })
}

/**
 * 重新加载并跳转（关闭所有页面，打开到应用内的某个页面）
 * 适合登录失效、注销退出或切换全局身份角色时使用
 *
 * @param path 目标路由路径
 * @param query 可选的路由查询参数对象
 *
 * @example
 * relaunch(targetPath)
 */
export function relaunch(path: string, query?: Query): void {
  const url = isTabRoute(path) ? normalizePath(path) : buildUrl(path.startsWith('/') ? path : `/${path}`, query)
  uni.reLaunch({ url })
}

/**
 * 安全回退：尝试返回上一页；若无页面栈（如直接从分享卡片或扫码进入）则执行降级重定向
 *
 * @param fallback 降级跳转的目标路径
 *
 * @example
 * backOr(fallbackPath) // 无上一页或回退失败时，跳到调用方指定的页面
 */
export function backOr(fallback: string): void {
  if (getCurrentPages().length <= 1) {
    redirect(fallback)
    return
  }
  uni.navigateBack({ fail: () => redirect(fallback) })
}

/**
 * 返回已有页面；无上一页时不跳转，不选择任何业务页面
 * 如需失败兜底，请使用 backOr(fallback)，目标由调用方指定
 *
 * @param delta 回退的层数，默认 1
 *
 * @example
 * back() // 返回上一级
 * back(2) // 返回上两级
 */
export function back(delta = 1): void {
  if (getCurrentPages().length > 1) {
    const steps = Number.isFinite(delta) ? Math.max(1, Math.floor(delta)) : 1
    uni.navigateBack({ delta: Math.min(steps, getCurrentPages().length - 1) })
  }
}

/**
 * 开放链接跳转解析器
 * 处理后台运营配置的动态链接（如 Banner 点击、公告跳转等）：
 * - HTTP/HTTPS 外链在 H5 环境下通过 window.location 跳转，App 使用系统浏览器，小程序提示暂不支持
 * - 小程序内部路径统一委托给智能跳转方法 `go()`
 *
 * @param url 后台返回的链接字符串（支持外链或应用内部路径）
 *
 * @example
 * openLink('https://example.com/activity') // H5 跳转外链，App 打开系统浏览器
 * openLink('/pages/ordering/shop/detail?id=5') // 走内部 go() 跳转
 */
export function openLink(url?: string | null): void {
  url = url?.trim()
  if (!url) {
    return
  }
  if (/^https?:\/\//i.test(url)) {
    // 平台差异在编译时处理；PC 浏览器与手机浏览器均走 H5。
    // #ifdef H5
    window.location.href = url
    // #endif
    // #ifdef APP-PLUS
    plus.runtime.openURL(url)
    // #endif
    // #ifndef H5 || APP-PLUS
    uni.showToast({ title: '当前平台暂不支持打开外部链接', icon: 'none' })
    // #endif
    return
  }
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url)) {
    uni.showToast({ title: '不支持的链接类型', icon: 'none' })
    return
  }
  go(url)
}
