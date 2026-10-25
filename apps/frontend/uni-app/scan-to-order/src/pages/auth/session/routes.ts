/** 共享会话拥有三端登录入口及当前页面的身份归属规则。 */
import type { SessionIdentity } from './models/identity'

export const AUTH_ROUTES = {
  customer: '/pages/auth/login/index',
  shop: '/pages-shop/auth/login/index',
  rider: '/pages-rider/auth/login/index',
} as const satisfies Record<SessionIdentity, string>

/** 根据页面所属分包选择登录身份，其他页面默认使用客户端身份。 */
export function identityForPath(path: string): SessionIdentity {
  const pathname = path.split(/[?#]/)[0].replace(/^\/?/, '/')
  if (pathname.startsWith('/pages-shop/'))
    return 'shop'
  if (pathname.startsWith('/pages-rider/'))
    return 'rider'
  return 'customer'
}
