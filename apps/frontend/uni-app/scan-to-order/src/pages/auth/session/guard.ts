/** 会话业务身份检查及登录引导，不参与 HTTP 传输。 */
import type { SessionIdentity } from './models/identity'
import { redirectToLogin } from './loginNavigation'
import { getIdentity, getToken } from './service'

/** 检查当前身份，未登录时引导至对应登录页。@example requireIdentity('customer') */
export function requireIdentity(target: SessionIdentity): boolean {
  if (getToken() && getIdentity() === target)
    return true

  if (getIdentity() && getIdentity() !== target)
    uni.showToast({ title: '请先退出当前身份', icon: 'none' })
  else
    redirectToLogin({ identity: target })

  return false
}
