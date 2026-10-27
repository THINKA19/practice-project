/** 地址开发样本：初始为空，按顾客隔离，支持增删改及默认地址。 */
import { defineMock } from '@alova/mock'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { endpoints } from '../api/endpoints'
import type { Address, AddressForm } from '../models/types'
import { checkAddressDraft, validateAddress } from '../domain/address.rules'

const accounts = new Map<string, Address[]>()
let nextId = 1
function rows(authorization: unknown) {
  if (!/^Bearer wx-demo-session-\S+$/.test(String(authorization)))
    throw new Error('请先登录顾客账户')
  const owner = mockCustomerOwner(authorization)
  if (!accounts.has(owner))
    accounts.set(owner, [])
  return accounts.get(owner)!
}
/** 清空开发地址，不修改真实账户数据。 */
export function reset() {
  accounts.clear()
  nextId = 1
}
export default defineMock({
  [`[POST]${endpoints.list}`]: withFailure(({ headers }) => ok({ result: rows(headers.Authorization).map(row => ({ ...row })) })),
  [`[GET]${endpoints.detail}`]: withFailure(({ headers, query }) => {
    const row = rows(headers.Authorization).find(item => item.id === Number(query.id))
    return row ? ok({ info: { ...row } }) : fail('地址不存在')
  }),
  [`[GET]${endpoints.defaultAddress}`]: withFailure(({ headers }) => {
    const row = rows(headers.Authorization).find(item => item.isDefault)
    return ok(row ? { info: { ...row } } : null)
  }),
  [`[POST]${endpoints.add}`]: withFailure(({ headers, data }) => {
    const form = data as AddressForm
    if (validateAddress(form) || checkAddressDraft(form))
      return fail('请完整填写地址')
    const list = rows(headers.Authorization)
    const row: Address = { ...form, id: nextId++, isDefault: !list.length || form.isDefault === true }
    if (row.isDefault)
      list.forEach((item) => { item.isDefault = false })
    list.push(row)
    return ok({ ...row })
  }, { write: true }),
  [`[POST]${endpoints.update}`]: withFailure(({ headers, data }) => {
    const body = data as Record<string, unknown>
    const list = rows(headers.Authorization)
    const row = list.find(item => item.id === Number(body.id))
    if (!row)
      return fail('地址不存在')
    if ('linkMan' in body) {
      const form = data as AddressForm
      if (validateAddress(form) || checkAddressDraft(form))
        return fail('请完整填写地址')
      Object.assign(row, form)
    }
    if (body.isDefault === true || body.isDefault === 'true')
      list.forEach((item) => { item.isDefault = item.id === row.id })
    return ok({ ...row })
  }, { write: true }),
  [`[POST]${endpoints.remove}`]: withFailure(({ headers, data }) => {
    const list = rows(headers.Authorization)
    const index = list.findIndex(item => item.id === Number((data as { id?: unknown }).id))
    if (index < 0)
      return fail('地址不存在')
    const [removed] = list.splice(index, 1)
    if (removed.isDefault && list.length)
      list[0].isDefault = true
    return ok(null)
  }, { write: true }),
})
