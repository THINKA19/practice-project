import { sessionState } from '@/pages/auth/session/mock'
import { createWorkspace } from './fixtures'

/** 验证骑手凭证并返回当前账号的开发演示数据。 */
export function read(authorization: string) {
  if (sessionState.profile(authorization.replace(/^Bearer /, ''))?.identity !== 'rider')
    throw new Error('骑手登录已失效')
  return createWorkspace()
}
