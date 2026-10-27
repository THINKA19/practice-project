import { endpoints } from './endpoints'
import { API_DOMAINS, http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import type { AddressDto as Address, AddressDetailDto as AddressDetail, AddressFormDto as AddressForm, RegionDto as Region } from './address.dto'

export const addressRequests = {
  list(data: Record<string, unknown> = {}) {
    return http.Post<{ result: Address[] }>(endpoints.list, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false, domain: API_DOMAINS.SECONDARY } }).send()
  },
  detail(id: number | string) {
    return http.Get<AddressDetail>(endpoints.detail, { params: { id }, headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false, domain: API_DOMAINS.SECONDARY } }).send()
  },
  defaultAddress() {
    return http.Get<AddressDetail>(endpoints.defaultAddress, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false, domain: API_DOMAINS.SECONDARY } }).send()
  },
  add(form: AddressForm) {
    return http.Post<Address>(endpoints.add, form as unknown as Record<string, unknown>, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false, domain: API_DOMAINS.SECONDARY } }).send()
  },
  update(form: AddressForm) {
    return http.Post<unknown>(endpoints.update, form as unknown as Record<string, unknown>, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false, domain: API_DOMAINS.SECONDARY } }).send()
  },
  setDefault(id: number | string) {
    return http.Post<unknown>(endpoints.update, { id, isDefault: 'true' }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false, domain: API_DOMAINS.SECONDARY } }).send()
  },
  remove(id: number | string) {
    return http.Post<unknown>(endpoints.remove, { id }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false, domain: API_DOMAINS.SECONDARY } }).send()
  },
  provinces() {
    return http.Get<Region[]>(endpoints.provinces, { cacheFor: 0, meta: { ignoreAuth: true, toast: false, domain: API_DOMAINS.SECONDARY } }).send()
  },
  children(pid: string) {
    return http.Get<Region[]>(endpoints.children, { params: { pid }, cacheFor: 0, meta: { ignoreAuth: true, toast: false, domain: API_DOMAINS.SECONDARY } }).send()
  },
}
