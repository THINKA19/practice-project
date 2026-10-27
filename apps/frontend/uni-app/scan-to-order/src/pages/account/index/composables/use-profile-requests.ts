import type { CustomerProfileForm } from '../models/types'
import { parseProfile } from '../models/mappers'
import { profileRequests } from '../api/profile.api'
import { useSessionState } from '@/pages/auth/session'

/** 资料接口只更新性别和生日；头像昵称由账号身份接口提供。 */
async function profileRequest(request: () => Promise<unknown>): Promise<CustomerProfileForm> {
  const session = useSessionState()
  const revision = session.sessionRevision
  try {
    return parseProfile(await request())
  }
  catch (error) {
    // 公共 HTTP 将业务码格式化到 Error.message；只处理明确的身份失效。
    if (error instanceof Error && error.message.includes('请求错误[401]') && revision === session.sessionRevision) {
      session.clearSession()
      uni.showToast({ title: '登录已失效，请重新登录', icon: 'none' })
    }
    throw error
  }
}
/** 顾客资料门面：解析性别/生日；只有同一会话的明确 401 才触发本地失效处理。 */
export const profileApi = {
  read: () => profileRequest(() => profileRequests.read()),
  save: (form: CustomerProfileForm) => profileRequest(() => profileRequests.save({ gender: form.gender, birthday: form.birthday })),
}
