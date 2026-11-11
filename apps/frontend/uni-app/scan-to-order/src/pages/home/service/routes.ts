/**
 * ============================================================================
 * 【文件概述】首页服务页面路径。
 * 【方法与导出清单】HomeServiceRoutes：服务详情与礼品卡子页面。
 * 【综合使用示例】
 * import { HomeServiceRoutes } from '@/pages/home/service/routes'
 * uni.navigateTo({ url: HomeServiceRoutes.cardExchange })
 * ============================================================================
 */
export const HomeServiceRoutes = {
  groupBuyingDetail: '/pages/home/service/group-buying-detail/index',
  cardExchange: '/pages/home/service/gift-card-exchange/index',
  cardLogs: '/pages/home/service/gift-card-logs/index',
  cardSend: '/pages/home/service/gift-card-send/index',
  cardReceive: '/pages/home/service/gift-card-receive/index',
} as const

/** 生成领取路由，供小程序分享、H5 链接和站内领取使用。 */
export function giftReceivePath(id: string | number, token: string) {
  return `${HomeServiceRoutes.cardReceive}?id=${encodeURIComponent(id)}&shareToken=${encodeURIComponent(token)}`
}

/** 根据 H5 当前部署路径生成对外领取地址，保留应用的部署子目录。 */
export function giftReceiveUrl(path: string, current: string, mode: string, base: string) {
  const url = new URL(current)
  url.search = ''
  url.hash = ''
  if (mode === 'history')
    url.pathname = `${base.replace(/\/$/, '')}${path.split('?')[0]}`
  else
    url.hash = path
  if (mode === 'history')
    url.search = path.split('?')[1] || ''
  return url.href
}

/** 校验粘贴的地址属于当前 H5 应用，返回可交给站内导航的领取路由。 */
export function parseGiftReceiveUrl(input: string, current: string, mode: string, base: string) {
  const expected = new URL(giftReceiveUrl(HomeServiceRoutes.cardReceive, current, mode, base))
  const url = new URL(input.trim())
  const route = mode === 'history' ? url : new URL(url.hash.slice(1), url.origin)
  if (url.origin !== expected.origin || url.pathname !== expected.pathname
    || route.origin !== expected.origin
    || route.pathname !== (mode === 'history' ? expected.pathname : HomeServiceRoutes.cardReceive)) {
    return null
  }
  const id = route.searchParams.get('id') || ''
  const token = route.searchParams.get('shareToken') || ''
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0 || !token.trim())
    return null
  return giftReceivePath(id, token)
}
