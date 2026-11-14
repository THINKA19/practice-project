import { USE_MOCK } from '@/mock/config'
import { http } from '@/http/alova'
import { permissionEndpoint } from './endpoints'
/** 消费一次性邀请；开发分包采用已隔离的模拟接缝。@param token 凭证 @param code 邀请码 @returns 接受结果 @example await acceptInviteRequest(token, code) // 确认或失败 */
export async function acceptInviteRequest(token: string, code: string) {
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝；生产构建移除。
    return (await import('@/pages-shop/staff/index/mock')).acceptInvite(token, code)
  }
  return http.Post(permissionEndpoint('INVITE'), { code }, { headers: { Authorization: 'Bearer ' + token }, cacheFor: 0, meta: { toast: false } }).send()
}
