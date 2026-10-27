/** 开发样本仅验证展示链路，不实现真实核销授权。 */
import { defineMock } from '@alova/mock'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { endpoints } from '../api/endpoints'

let sequence = 0
export default defineMock({
  [`[GET]${endpoints.demoCode}`]: withFailure(({ headers }) => {
    const authorization = String(headers.Authorization ?? '')
    if (!/^Bearer wx-demo-session-\S+$/.test(authorization))
      return fail('请使用有效顾客会话', 401)
    try {
      mockCustomerOwner(authorization)
      sequence++
      return ok({ code: `DEMO-${Date.now()}-${sequence}`, expiresAt: Date.now() + 60000, demo: true })
    }
    catch {
      return fail('请使用顾客会话', 403)
    }
  }),
})
