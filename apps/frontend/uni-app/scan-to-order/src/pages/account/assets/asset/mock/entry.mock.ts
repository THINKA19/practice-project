import { endpoints } from '../api/endpoints'
import { defineMock } from '@alova/mock'
import { ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { assetDemoOwner, demoAmount, demoRecharge, demoRules, resetWalletDemo } from './state'

export const reset = resetWalletDemo
export default defineMock({
  [`[GET]${endpoints.demoAmount}`]: withFailure(({ headers }) => ok(demoAmount(assetDemoOwner(headers.Authorization)))),
  [`[GET]${endpoints.demoRules}`]: withFailure(() => ok(demoRules.map(rule => ({ ...rule })))),
  [`[POST]${endpoints.demoRecharge}`]: withFailure(({ headers, data }) => {
    const body = data as { amount?: unknown, requestId?: unknown }
    return ok(demoRecharge(assetDemoOwner(headers.Authorization, true), body?.amount, body?.requestId))
  }, { write: true }),
})
