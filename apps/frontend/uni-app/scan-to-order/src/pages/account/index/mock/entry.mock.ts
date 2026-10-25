/** 开发资产演示样本，沿用 Mock 客户归属解析；不作为正式服务授权实现。 */
import { defineMock } from '@alova/mock'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { endpoints } from '../api/endpoints'

export default defineMock({
  [`[GET]${endpoints.assets}`]: withFailure(({ headers }) => {
    const authorization = String(headers.Authorization ?? '')
    if (!/^Bearer wx-demo-session-\S+$/.test(authorization))
      return fail('请使用有效顾客会话', 401)
    try {
      // 与其他业务 Mock 一致：已知凭证检查客户身份，刷新后未知的开发凭证作为稳定归属。
      // 本接口仅返回统一演示样本，不返回私人资产，也不修改或恢复正式会话。
      mockCustomerOwner(authorization)
    }
    catch {
      return fail('请使用顾客会话', 403)
    }
    // 固定演示样本，不产生真实金额操作，也不接受外部用户 ID。
    return ok({ couponCount: 3, balanceCents: 12850, points: 260, demo: true })
  }),
})
