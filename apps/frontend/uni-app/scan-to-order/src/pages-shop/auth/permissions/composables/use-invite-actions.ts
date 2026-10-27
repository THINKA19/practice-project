/**
 * 【文件概述】接受门店邀请，服务端校验邀请和当前身份。
 * 【方法与导出清单】见下方具名导出。
 * 【综合使用示例】通过所属模块 index.ts 调用。
 */
import { acceptInviteRequest } from '../api/invite.api'

/** 提交当前商家凭证与非空邀请码；邀请归属及权限授予由服务端判定。 */
export function acceptStaffInvite(token: string, code: string) {
  if (!token || !code.trim())
    throw new Error('邀请参数无效')

  return acceptInviteRequest(token, code)
}
