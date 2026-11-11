import { slicePage as demoPage } from '@/utils/project/paged-response'
import { endpoints } from '../api/endpoints'
import { defineMock } from '@alova/mock'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { addDemoCoupon, couponDemo, couponTemplates, resetCouponDemo } from './state'

export const reset = resetCouponDemo
export default defineMock({
  [`[GET]${endpoints.demoTemplates}`]: withFailure(({ headers, query }) => {
    const account = couponDemo(assetDemoOwner(headers.Authorization))
    return ok(demoPage(couponTemplates.map(item => ({ ...item, claimed: account.claimed.has(item.id) })), query))
  }),
  [`[GET]${endpoints.demoDetail}`]: withFailure(({ query }) => {
    const template = couponTemplates.find(item => item.id === Number(query.id))
    return template ? ok(template) : fail('优惠券不存在')
  }),
  [`[GET]${endpoints.demoMy}`]: withFailure(({ headers, query }) => {
    const mine = couponDemo(assetDemoOwner(headers.Authorization)).mine
    return ok(demoPage(mine.filter(item => String(query.status ?? 0).split(',').includes(String(item.status))), query))
  }),
  [`[GET]${endpoints.demoStatistics}`]: ({ headers }) => ok({ canUse: couponDemo(assetDemoOwner(headers.Authorization)).mine.filter(item => item.status === 0).length }),
  [`[POST]${endpoints.demoFetch}`]: withFailure(({ headers, data }) => {
    const owner = assetDemoOwner(headers.Authorization, true)
    const body = data as { id?: number, pwd?: string }
    const template = couponTemplates.find(item => item.id === Number(body?.id))
    if (!template)
      return fail('优惠券已领完', 20001)
    const account = couponDemo(owner)
    if (account.claimed.has(template.id))
      return fail('已经领取过该券', 20003)
    if (template.pwd && body.pwd !== 'DEMO')
      return fail('口令不正确')
    addDemoCoupon(owner, template)
    account.claimed.add(template.id)
    return ok(null)
  }, { write: true }),
  [`[POST]${endpoints.demoExchange}`]: withFailure(({ headers, data }) => {
    const owner = assetDemoOwner(headers.Authorization, true)
    const body = data as { number?: string, pwd?: string }
    if (body?.number !== 'DEMO2026' || body?.pwd !== 'DEMO')
      return fail('券号或密码不正确')
    const account = couponDemo(owner)
    if (account.exchanged.has(body.number))
      return fail('兑换码已使用')
    addDemoCoupon(owner, couponTemplates[0])
    account.exchanged.add(body.number)
    return ok(null)
  }, { write: true }),
})

/** 本业务开发读写准入；账户身份由会话 Mock 解释。 */
function assetDemoOwner(authorization: unknown, write = false) {
  if (write && !/^Bearer wx-demo-session-\S+$/.test(String(authorization ?? '')))
    throw new Error('请先登录顾客账户')
  return mockCustomerOwner(authorization)
}
