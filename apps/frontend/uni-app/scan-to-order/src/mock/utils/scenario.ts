import type { MockServerRequest } from '@alova/mock'
import { mockConfig } from '../config'

export type MockHandler<T> = (request: MockServerRequest) => T

export interface FailureOptions {
  /** 0 永不失败，1 必定失败；仅用于模拟请求失败，不代表 HTTP 错误码。 */
  rate?: number
  /** 测试可注入固定序列，不替换全局 Math.random。 */
  random?: () => number
}

/** 先决定是否失败，再执行 handler；失败时不执行模拟写操作。 */
export function withFailure<T>(handler: MockHandler<T>, options: FailureOptions = {}): MockHandler<T> {
  const rate = options.rate ?? mockConfig.failureRate
  if (!Number.isFinite(rate) || rate < 0 || rate > 1)
    throw new RangeError('[mock] failure rate 必须在 0～1 之间')
  const random = options.random ?? Math.random
  return (request) => {
    if (rate === 1 || (rate > 0 && random() < rate))
      throw new Error('[mock] 模拟请求失败')
    return handler(request)
  }
}
