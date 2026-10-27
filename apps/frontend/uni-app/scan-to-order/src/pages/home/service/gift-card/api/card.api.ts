import { endpoints } from './endpoints'
import type { CardLogDto as CardLog, CardShareFetchResultDto as CardShareFetchResult, CardTemplateDto as CardTemplate, MyCardDto as MyCard } from './card.dto'
import { http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'

export const cardRequests = {
  list(data: Record<string, unknown> = {}) {
    return http.Get<CardTemplate[]>(endpoints.list, { params: data, cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  my() {
    return http.Get<MyCard[]>(endpoints.my, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  logs(data: Record<string, unknown> = {}) {
    return http.Post<{ result: CardLog[], totalPage?: number }>(endpoints.logs, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  exchange(data: Record<string, unknown>) {
    return http.Post<unknown>(endpoints.exchange, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  shareOpen(data: Record<string, unknown>) {
    return http.Post<{ id: number, [k: string]: unknown }>(endpoints.shareOpen, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  shareClose(data: Record<string, unknown>) {
    return http.Post<unknown>(endpoints.shareClose, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  shareFetch(data: Record<string, unknown>) {
    return http.Post<unknown>(endpoints.shareFetch, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  openShare(id: number | string, remark = '') {
    return http.Post<unknown>(endpoints.shareOpen, { id, remark }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  fetchShare(id: number | string, shareToken: string, calculate: boolean) {
    return http.Post<CardShareFetchResult>(endpoints.shareFetch, { id, shareToken, calculate }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
}
