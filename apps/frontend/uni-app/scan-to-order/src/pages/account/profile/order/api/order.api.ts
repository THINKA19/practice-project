import { endpoints } from './endpoints'
import type { CreateOrderResultDto as CreateOrderResult, OrderDetailDto as OrderDetail, OrderListResultDto as OrderListResult, RefundApplyDto as RefundApply } from './order.dto'
import { http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'

export const orderRequests = {
  demoAction(orderId: number, action: 'pay' | 'refund') {
    return http.Post<unknown>(endpoints.demoAction, { orderId, action }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  shopPhone(id: number) {
    return http.Get<{ info?: { linkPhone?: string } }>(endpoints.shopDetail, { params: { id }, cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  create(data: Record<string, unknown>) {
    return http.Post<CreateOrderResult>(endpoints.create, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  list(data: Record<string, unknown>) {
    return http.Post<OrderListResult>(endpoints.list, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  detail(id: string | number, hxNumber = '', peisongOrderId = '') {
    return http.Get<OrderDetail>(endpoints.detail, { params: { id, hxNumber, peisongOrderId }, headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  close(orderId: number | string) {
    return http.Post<unknown>(endpoints.close, { orderId }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  remove(orderId: number | string) {
    return http.Post<unknown>(endpoints.remove, { orderId }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  payByBalance(orderId: number | string) {
    return http.Post<unknown>(endpoints.payByBalance, { orderId }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  delivery(orderId: number | string) {
    return http.Post<unknown>(endpoints.delivery, { orderId }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  reputation(postJsonString: string) {
    return http.Post<unknown>(endpoints.reputation, { postJsonString }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  hx(data: Record<string, unknown>) {
    return http.Post<unknown>(endpoints.hx, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  cyTableAddOrder(data: Record<string, unknown>) {
    return http.Post<unknown>(endpoints.cyTableAddOrder, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  refundApply(data: Record<string, unknown>) {
    return http.Post<unknown>(endpoints.refundApply, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  refundApplyDetail(orderId: number | string, orderGoodsId: number | string = '') {
    return http.Get<RefundApply[]>(endpoints.refundApplyDetail, { params: { orderId, orderGoodsId }, headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  refundApplyCancel(orderId: number | string, orderGoodsId: number | string = '') {
    return http.Post<unknown>(endpoints.refundApplyCancel, { orderId, orderGoodsId }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  refundApplySetBackLogistics(data: Record<string, unknown>) {
    return http.Post<unknown>(endpoints.refundApplySetBackLogistics, data, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
}
