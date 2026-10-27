/** 签到演示按顾客凭证隔离，同一天重复提交不重复记分。 */
import { defineMock } from '@alova/mock'
import { ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { endpoints } from '../api/endpoints'
import { hasSignedToday } from '../domain/sign-in.rules'
import type { SignLog } from '../models/types'

const logs = new Map<string, SignLog[]>()
export function reset() {
  logs.clear()
}
function own(authorization: unknown) {
  if (!/^Bearer wx-demo-session-\S+$/.test(String(authorization ?? '')))
    throw new Error('请先登录顾客账户')
  const key = mockCustomerOwner(authorization)
  if (!logs.has(key))
    logs.set(key, [])
  return logs.get(key)!
}
export default defineMock({
  [`[POST]${endpoints.signLogs}`]: withFailure(({ headers }) => ok({ result: own(headers.Authorization) })),
  [`[POST]${endpoints.sign}`]: withFailure(({ headers }) => {
    const items = own(headers.Authorization)
    if (!hasSignedToday(items)) {
      const date = new Date()
      const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      items.push({ id: items.length + 1, dateAdd: day })
    }
    return ok({ signed: true })
  }, { write: true }),
})
