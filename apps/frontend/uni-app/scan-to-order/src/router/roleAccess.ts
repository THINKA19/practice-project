import type { SessionIdentity } from '@/api/types/login'
import { ShopRoutes } from '@/pages-shop/routes'
import { RiderRoutes } from '@/pages-rider/routes'

/** 按现有业务目录判断身份；不依赖通用导航工具，不注册尚不存在的页面。 */
export function decideRouteAccess(path: string, identity: SessionIdentity | null, loggedIn: boolean) {
  const pathname = path.split(/[?#]/)[0]
  const target = pathname.startsWith('/pages-shop/')
    ? 'shop'
    : pathname.startsWith('/pages-rider/')
      ? 'rider'
      : pathname.startsWith('/pages/') ? 'customer' : null
  if (!target)
    return true
  // 保留过期身份的互斥约束，必须显式退出后才能进入另一端。
  if (identity && identity !== target)
    return false
  if (target === 'customer')
    return true // 顾客匿名浏览和登录要求继续由脚手架控制。
  const login = target === 'shop' ? ShopRoutes.Access.login : RiderRoutes.Access.login
  return pathname === login || (loggedIn && identity === target)
}
