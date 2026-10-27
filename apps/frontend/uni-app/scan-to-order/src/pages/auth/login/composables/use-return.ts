/** 登录成功后优先返回栈内原页面；无原页面时只替换登录页，保留其余历史。 */
import { isPageTabbar } from '@/tabbar/store'
import { tabbarCacheEnable } from '@/tabbar/config'

interface LoginReturnPage {
  route?: string
  options?: Record<string, unknown>
  $page?: { fullPath?: string }
}

function pageTarget(page: LoginReturnPage) {
  if (page.$page?.fullPath)
    return page.$page.fullPath
  const path = `/${(page.route || '').replace(/^\//, '')}`
  const query = Object.entries(page.options ?? {})
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
  return query ? `${path}?${query}` : path
}

/** target 已由 resolveRedirect 校验；它是原业务目标，不是返回按钮的固定兜底地址。 */
export function returnAfterLogin(target: string): Promise<void> {
  const pages: LoginReturnPage[] = getCurrentPages()
  const last = pages.length - 1
  let previous = -1
  for (let index = last - 1; index >= 0; index--) {
    if (pageTarget(pages[index]) === target) {
      previous = index
      break
    }
  }

  return new Promise((resolve, reject) => {
    const openTarget = () => {
      const callbacks = { success: () => resolve(), fail: reject }
      if (tabbarCacheEnable && isPageTabbar(target.split('?')[0]))
        uni.switchTab({ url: target.split('?')[0], ...callbacks })
      else
        uni.redirectTo({ url: target, ...callbacks })
    }
    if (previous >= 0)
      uni.navigateBack({ delta: last - previous, success: () => resolve(), fail: openTarget })
    else
      openTarget()
  })
}
