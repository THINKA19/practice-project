import { slicePage as demoPage } from '@/utils/project/paged-response'
import { endpoints } from '../api/endpoints'
import { defineMock } from '@alova/mock'
import { ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { mockCustomerOwner } from '@/pages/auth/session/mock'

export default defineMock({
  [`[POST]${endpoints.demoLogs}`]: withFailure(({ headers, data }) => {
    assetDemoOwner(headers.Authorization)
    return ok(demoPage(Array.from({ length: 56 }, (_, i) => ({
      id: 56 - i,
      score: i % 2 ? -20 : 50,
      typeStr: i % 2 ? '积分兑换' : '消费奖励',
      dateAdd: '2026-10-20 12:00:00',
    })), data))
  }),
})

/** 本业务开发读写准入；账户身份由会话 Mock 解释。 */
function assetDemoOwner(authorization: unknown, write = false) {
  if (write && !/^Bearer wx-demo-session-\S+$/.test(String(authorization ?? '')))
    throw new Error('请先登录顾客账户')
  return mockCustomerOwner(authorization)
}
