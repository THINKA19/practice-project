/** 开发资产演示样本，沿用 Mock 客户归属解析；不作为正式服务授权实现。 */
import { defineStore } from 'pinia'
import { defineMock } from '@alova/mock'
import { parseProfile } from '../models/mappers'
import type { CustomerProfileForm } from '../models/types'
import { mockCustomerOwner, sessionState } from '@/pages/auth/session/mock'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { endpoints } from '../api/endpoints'
import { demoAmount } from '../../assets/asset/mock'
import { couponDemo } from '../../assets/coupons/mock'

function isCustomer(authorization: unknown) {
  try {
    if (!/^Bearer wx-demo-session-\S+$/.test(String(authorization ?? '')))
      return false
    mockCustomerOwner(authorization)
    return true
  }
  catch { return false }
}

const useProfileData = defineStore('mock-customer-profile-v1', {
  state: () => ({ profiles: {} as Record<string, CustomerProfileForm> }),
  persist: true,
})
export function reset() {
  useProfileData().$reset()
}
function account(headers: Record<string, unknown>) {
  const token = String(headers.Authorization ?? '').replace(/^Bearer /, '')
  const user = sessionState.profile(token)
  if (!user || user.identity !== 'customer')
    throw new Error('请先登录顾客账号')
  return { token, user }
}

export default defineMock({
  // 公共 Uniapp Mock 适配器对 upload 返回原始字符串，与真实 uploadFile 协议一致。
  [`[POST]${endpoints.upload}`]: withFailure(({ headers }) => {
    const result = isCustomer(headers.Authorization)
      ? ok({ url: 'https://example.invalid/mock/account/attachment', demo: true })
      : fail('请先登录顾客账户', 401)
    return JSON.stringify(result)
  }, { write: true }),

  [`[GET]${endpoints.demoProfile}`]: ({ headers }) => {
    try {
      const { user } = account(headers)
      return ok(useProfileData().profiles[String(user.userId)] ?? { gender: 'unknown', birthday: '' })
    }
    catch { return fail('请先登录顾客账号', 401) }
  },
  [`[POST]${endpoints.demoProfile}`]: ({ headers, data }) => {
    try {
      const { user } = account(headers)
      const form = parseProfile(data)
      useProfileData().profiles[String(user.userId)] = form
      return ok(form)
    }
    catch { return fail('资料保存失败，请检查登录状态和输入') }
  },

  [`[GET]${endpoints.assetsPreview}`]: withFailure(() => {
    return ok({ couponCount: 3, balanceCents: 12850, points: 260, demo: true })
  }),
  [`[GET]${endpoints.assets}`]: withFailure(({ headers }) => {
    const authorization = String(headers.Authorization ?? '')
    if (!/^Bearer wx-demo-session-\S+$/.test(authorization))
      return fail('请使用有效顾客会话', 401)
    try {
      // 与其他业务 Mock 一致：已知凭证检查客户身份，刷新后未知的开发凭证作为稳定归属。
      // 本接口仅返回统一演示样本，不返回私人资产，也不修改或恢复正式会话。
      const owner = mockCustomerOwner(authorization)
      const amount = demoAmount(owner)
      return ok({ couponCount: couponDemo(owner).mine.filter(item => item.status === 0).length, balanceCents: Math.round(amount.balance * 100), points: amount.score, demo: true })
    }
    catch {
      return fail('请使用顾客会话', 403)
    }
  }),
})
