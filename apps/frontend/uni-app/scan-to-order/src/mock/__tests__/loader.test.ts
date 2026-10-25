import { defineMock } from '@alova/mock'
import { describe, expect, it } from 'vitest'
import { discoverMockModules, registerMockModules, resetAllMocks } from '../loader'

describe('loader', () => {
  it('重复路由明确失败，不按模块顺序静默覆盖', () => {
    expect(() => registerMockModules({
      first: defineMock({ '/foo': () => null }),
      second: defineMock({ '[get]/foo': () => null }),
    })).toThrow('重复路由 [GET]/foo')
    expect(registerMockModules({
      get: defineMock({ '[GET]/foo': () => null }),
      post: defineMock({ '[POST]/foo': () => null }),
      disabled: defineMock({ '[GET]/foo': () => null }, false),
    })).toHaveLength(3)
  })

  it('发现独立入口并汇总重置', () => {
    const entries = discoverMockModules()
    expect(Object.keys(entries).length).toBeGreaterThan(0)
    resetAllMocks()
    expect(() => registerMockModules(Object.fromEntries(Object.entries(entries).map(([path, entry]) => [path, entry.default])))).not.toThrow()
  })
})

it('统一重置恢复原实例的订单状态', async () => {
  const { pickupState } = await import('@/pages/pickup/index/mock')
  const code = pickupState.list('reset-owner').orderList[0].hxNumber
  expect(pickupState.verify('reset-owner', code)).toBe(true)
  resetAllMocks()
  expect(pickupState.status('reset-owner', code)).toBe(1)
})
