import { couponRequests } from '../api/coupon.api'
import { getIdentity } from '@/pages/auth/session'
import { assetHeaders } from './use-context'
import { parseCouponPage, parseCouponTemplate } from '../models/mappers'

/** 优惠券业务门面：解析模板与持有券响应，为写操作提供顾客身份校验。 */
export const couponApi = {
  async templates(params: { page: number, pageSize: number }) {
    const data = await couponRequests.templates(params, getIdentity() === 'customer' ? assetHeaders() : {})
    return parseCouponPage(data, false)
  },
  async my(params: { page: number, pageSize: number, status: number | string }) {
    const data = await couponRequests.my(params, assetHeaders())
    return parseCouponPage(data, true)
  },
  async detail(id: number | string) {
    return parseCouponTemplate(await couponRequests.detail(id))
  },
  fetch(data: { id: number | string, pwd?: string }) {
    return couponRequests.fetch(data, assetHeaders(true))
  },
  exchange(number: string, pwd: string, extJsonStr = '') {
    return couponRequests.exchange(number, pwd, extJsonStr, assetHeaders(true))
  },
  statistics() {
    return couponRequests.statistics(assetHeaders())
  },
}
