/**
 * 【文件概述】接受门店邀请，服务端校验邀请和当前身份。
 * 【方法与导出清单】见下方具名导出。
 * 【综合使用示例】通过所属模块 index.ts 调用。
 */
import { http } from '@/http/http'
import { permissionEndpoint } from './endpoints'

export function acceptStaffInvite(token: string, code: string) {
  if (!token || !code.trim())
    throw new Error('邀请参数无效')

  return http.post(permissionEndpoint('INVITE'), { code }, undefined, { Authorization: `Bearer ${token}` })
}
