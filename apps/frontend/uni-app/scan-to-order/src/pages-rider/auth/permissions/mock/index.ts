import { sessionState } from '@/pages/auth/session/mock'
import { createGrant } from './fixtures'

/** 验证骑手凭证并返回当前账号的开发演示数据。 */
export function read(authorization: string) {
  const user = sessionState.profile(authorization.replace(/^Bearer /, ''))
  if (user?.identity !== 'rider')
    throw new Error('骑手登录已失效')
  return createGrant(String(user.userId))
}
