/** 三端共享登录引导，不依赖登录页面或分包实现。 */
import type { SessionIdentity } from './models/identity'
import { AUTH_ROUTES, identityForPath } from './routes'
import { getLastPage } from '@/utils'
import { debounce } from '@/utils/debounce'

export interface LoginNavigationOptions {
  /** 业务明确指定的身份；省略时根据当前页面所属分包选择。 */
  identity?: SessionIdentity
  /** 跳转方式，默认 navigateTo。 */
  mode?: 'navigateTo' | 'reLaunch'
  /** 显式查询串（含 ?）；省略时自动保存当前页面用于登录后回跳。 */
  queryString?: string
}

/**
 * 引导到目标身份登录页，500ms 防抖；支持 flush/cancel，兼容请求失效入口。
 * @param options 身份、跳转方式及显式查询串。
 * @example redirectToLogin({ identity: 'shop' })
 */
export const redirectToLogin = debounce((options: LoginNavigationOptions = {}) => {
  const { mode = 'navigateTo', queryString = '' } = options
  const currentPage = getLastPage()
  const currentPath = currentPage?.route ? `/${currentPage.route.replace(/^\//, '')}` : ''
  const loginPage = AUTH_ROUTES[options.identity ?? identityForPath(currentPath)]
  if (currentPath === loginPage)
    return

  const source = currentPage?.$page?.fullPath || currentPath
  const suffix = queryString || (source ? `?redirect=${encodeURIComponent(source)}` : '')
  const url = `${loginPage}${suffix}`
  if (mode === 'navigateTo')
    uni.navigateTo({ url })
  else
    uni.reLaunch({ url })
}, 500)
