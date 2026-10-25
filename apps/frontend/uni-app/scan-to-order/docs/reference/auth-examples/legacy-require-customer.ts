import { useTokenStore } from '@/store/token'
import { toLoginPage } from '@/utils/toLoginPage'
/** 顾客业务操作的前端会话门槛；服务端仍必须校验凭证、身份和数据归属。 */
export function requireCustomerSession(): boolean {
  const session = useTokenStore().updateNowTime()
  if (session.hasLogin && session.identity === 'customer')
    return true
  toLoginPage()
  return false
}
