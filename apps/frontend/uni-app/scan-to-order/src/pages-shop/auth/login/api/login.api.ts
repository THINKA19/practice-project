import { USE_MOCK } from '@/mock/config'
import type { IAuthLoginRes } from '@/pages/auth/session'
import type { LoginCredentialsDto } from './login.dto'
import { http } from '@/http/alova'
import { loginEndpoint } from './endpoints'

export const isDemo = USE_MOCK
/** 交换候选凭证，不提交会话；开发模拟仅在本分包加载，身份由 Session 再确认。 */
export async function loginRequest(data: LoginCredentialsDto): Promise<IAuthLoginRes> {
  return USE_MOCK
    ? (await import('../mock')).login(data.username, data.password)
    : http.Post<IAuthLoginRes>(loginEndpoint(), data, { meta: { ignoreAuth: true, toast: false }, cacheFor: 0 }).send()
}
