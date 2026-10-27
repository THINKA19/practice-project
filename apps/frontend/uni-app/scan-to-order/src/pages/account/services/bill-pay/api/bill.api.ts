import { http } from '@/http/alova'
import { getToken } from '@/pages/auth/session'
import type { PayBillDiscountDto as PayBillDiscount } from './bill.dto'
import { endpoints } from './endpoints'

export const billRequests = {
  rules() {
    return http.Get<PayBillDiscount[]>(endpoints.rules, { cacheFor: 0 }).send()
  },
  pay(amountCents: number, requestId: string) {
    return http.Post<{ payableCents: number, demo: true }>(endpoints.pay, { amountCents, requestId }, {
      headers: { Authorization: `Bearer ${getToken()}` },
      cacheFor: 0,
    }).send()
  },
}
