import { addressRequests } from '../api/address.api'
import type { Address, AddressForm, Region } from '../models/types'

import { normalizeAddress } from '../models/mappers'

/** 地址业务门面：将历史字符串/数字默认标记转换为布尔值，HTTP 请求留在 api 层。 */
export const addressApi = {
  async list(data: Record<string, unknown> = {}): Promise<Address[]> {
    const res = await addressRequests.list(data)

    return Array.isArray(res?.result) ? res.result.map(normalizeAddress) : []
  },
  detail(id: number | string) {
    return addressRequests.detail(id).then(result => ({ ...result, info: normalizeAddress(result.info) }))
  },
  defaultAddress() {
    return addressRequests.defaultAddress().then(result => result && ({ ...result, info: normalizeAddress(result.info) }))
  },
  add(form: AddressForm) {
    return addressRequests.add(form)
  },
  update(form: AddressForm) {
    return addressRequests.update(form)
  },
  /** 设为默认地址（原 selectTap：updateAddress { id, isDefault: 'true' }） */
  setDefault(id: number | string) {
    return addressRequests.setDefault(id)
  },
  remove(id: number | string) {
    return addressRequests.remove(id)
  },
  async provinces(): Promise<Region[]> {
    return (await addressRequests.provinces()) || []
  },
  async children(pid: string): Promise<Region[]> {
    return (await addressRequests.children(pid)) || []
  },
}
