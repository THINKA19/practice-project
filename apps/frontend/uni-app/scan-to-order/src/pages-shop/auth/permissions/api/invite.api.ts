import { http } from '@/http/http'
import { permissionEndpoint } from './endpoints'

/** 发送已由业务流程校验的邀请码与凭证，不在请求层决定邀请归属或授权结果。 */
export const acceptInviteRequest = (token: string, code: string) => http.post(permissionEndpoint('INVITE'), { code }, undefined, { Authorization: `Bearer ${token}` })
