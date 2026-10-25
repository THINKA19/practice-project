/**
 * ============================================================================
 * 【文件概述】提供确定性故障与延迟，不改变业务响应协议。
 * 【方法与导出清单】MockHandler、FailureOptions、withFailure、withDelay。
 * 【综合使用示例】
 * import { withFailure, withDelay } from '@/mock/scenario'
 * const handler = withFailure(() => 'ok', { scene: 'normal' }) // 固定成功
 * ============================================================================
 */
import type { MockServerRequest } from '@alova/mock'
import { mockConfig } from './config'

/**
 * Mock 请求处理函数；保留同步结果或原始 Promise 类型。
 * @example const handler: MockHandler<string> = () => 'ok'
 */
export type MockHandler<T> = (request: MockServerRequest) => T

/**
 * 故障配置；scene 固定切换，概率默认零，写操作跳过概率故障。
 * @example const options: FailureOptions = { scene: 'error', write: true }
 */
export interface FailureOptions {
  /** 0 永不失败，1 必定失败；仅用于模拟请求失败，不代表 HTTP 错误码。 */
  rate?: number
  /** 固定场景；业务空值和未登录由本模块 handler 返回。 */
  scene?: 'normal' | 'error'
  /** 写操作只能使用固定 error 场景，不使用概率失败。 */
  write?: boolean
  /** 测试可注入固定序列，不替换全局 Math.random。 */
  random?: () => number
}

/**
 * 在执行 handler 前注入明确故障，保护模拟写入。
 * @param handler 原始接口处理函数。
 * @param options 故障配置；默认成功，随机需显式注入。
 * @returns 同类型 handler；故障在原 handler 执行前抛出，不自动重试。
 * @example withFailure(() => 'ok', { scene: 'normal' }) // 返回固定成功的 handler
 */
export function withFailure<T>(handler: MockHandler<T>, options: FailureOptions = {}): MockHandler<T> {
  const rate = options.rate ?? mockConfig.failureRate
  if (!Number.isFinite(rate) || rate < 0 || rate > 1)
    throw new RangeError('[mock] failure rate 必须在 0～1 之间')
  if (!options.write && rate > 0 && rate < 1 && !options.random)
    throw new Error('[mock] 随机故障必须注入可复现的 random')
  const random = options.random ?? (() => 1)
  return (request) => {
    if (options.scene === 'error' || (!options.write && (rate === 1 || (rate > 0 && random() < rate))))
      throw new Error('[mock] 模拟请求失败')
    return handler(request)
  }
}

/**
 * 创建确定延迟场景，不改变响应结构或执行次数。
 * @param handler 原始接口处理函数。
 * @param delay 等待毫秒数，默认 1000。
 * @returns 异步 handler。
 * @example withDelay(() => 'ok', 0) // 调用后得到 Promise<'ok'>
 */
export function withDelay<T>(handler: MockHandler<T>, delay = 1000) {
  if (!Number.isFinite(delay) || delay < 0)
    throw new RangeError('[mock] delay 必须为非负数')
  return async (request: MockServerRequest) => {
    await new Promise(resolve => setTimeout(resolve, delay))
    return handler(request)
  }
}
