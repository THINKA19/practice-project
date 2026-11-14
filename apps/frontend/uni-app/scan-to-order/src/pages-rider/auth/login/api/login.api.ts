import type { IAuthLoginRes } from '@/pages/auth/session'
import type { LoginCredentialsDto, WechatPhoneCredentialsDto } from './login.dto'
import { http } from '@/http/alova'
import { USE_MOCK } from '@/mock/config'
import { loginEndpoint } from './endpoints'

const requestOptions = { meta: { ignoreAuth: true, toast: false }, cacheFor: 0 }
const wechatLoginPath: unknown = import.meta.env.VITE_RIDER_WECHAT_LOGIN_URL

function isLocalPath(value: unknown): value is string {
  return typeof value === 'string' && /^\/(?![/\\])[^\s\\]+$/.test(value)
}

/** 开发演示固定使用模块 Mock，微信授权仅对接真实服务。 */
export const isDemo = import.meta.env.DEV && USE_MOCK
export const riderLoginAvailable = isDemo || !!(import.meta.env.VITE_RIDER_LOGIN_URL && import.meta.env.VITE_RIDER_PROFILE_URL)

function configuredWechatPath() {
  if (!USE_MOCK && import.meta.env.VITE_RIDER_PROFILE_URL && isLocalPath(wechatLoginPath))
    return wechatLoginPath
}

export const riderWechatLoginAvailable = !!configuredWechatPath()

export async function loginRequest(data: LoginCredentialsDto): Promise<IAuthLoginRes> {
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- 骑手模块的开发模拟入口，生产构建移除。
    return (await import('../mock')).login(data.username, data.password)
  }

  return http.Post<IAuthLoginRes>(loginEndpoint(), data, requestOptions).send()
}

export async function loginWithWechatPhone(data: WechatPhoneCredentialsDto): Promise<IAuthLoginRes> {
  const path = configuredWechatPath()
  if (!path)
    throw new Error('微信登录服务暂不可用，请使用账号密码登录')

  return http.Post<IAuthLoginRes>(path, data, requestOptions).send()
}
