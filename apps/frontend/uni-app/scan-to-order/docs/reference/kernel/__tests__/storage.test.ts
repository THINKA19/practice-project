// 历史参考资料：禁止正式业务导入；按需提取到正式模块后再接入和验证。
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { StorageDriver } from '../storage'
import { createSafeStorage } from '../storage'

describe('kernel Storage Service', () => {
  let memoryMap: Map<string, string>
  let mockDriver: StorageDriver

  beforeEach(() => {
    memoryMap = new Map()
    mockDriver = {
      getItem: k => memoryMap.get(k) ?? null,
      setItem: (k, v) => memoryMap.set(k, v),
      removeItem: k => memoryMap.delete(k),
      clear: () => memoryMap.clear(),
      keys: () => [...memoryMap.keys()],
    }
  })

  it('能正常存取对象及基础类型', () => {
    const storage = createSafeStorage({ driver: mockDriver, prefix: 'APP_' })
    storage.set('USER', { name: 'Alex' })
    const user = storage.get<{ name: string }>('USER')
    expect(user).toEqual({ name: 'Alex' })
  })

  it('清理当前前缀包含旧实例的数据，不清理其他命名空间', () => {
    createSafeStorage({ driver: mockDriver, prefix: 'a:' }).set('old', 1)
    const other = createSafeStorage({ driver: mockDriver, prefix: 'b:' })
    other.set('token', 'keep')
    expect(createSafeStorage({ driver: mockDriver, prefix: 'a:' }).clear()).toBe(true)
    expect(memoryMap.has('a:old')).toBe(false)
    expect(other.get('token')).toBe('keep')
  })

  it('缺少枚举能力时拒绝按前缀清理，空前缀仍可清空驱动', () => {
    const driver = { ...mockDriver, keys: undefined }
    memoryMap.set('other', 'keep')
    expect(createSafeStorage({ driver, prefix: 'a:' }).clear()).toBe(false)
    expect(memoryMap.get('other')).toBe('keep')
    expect(createSafeStorage({ driver }).clear()).toBe(true)
    expect(memoryMap.size).toBe(0)
  })

  it('支持 TTL 自动过期自销毁', () => {
    vi.useFakeTimers()
    const storage = createSafeStorage({ driver: mockDriver })

    // 设置 1000 毫秒过期
    storage.set('TOKEN', 'abc', 1000)
    expect(storage.get('TOKEN')).toBe('abc')

    // 前进 1001 毫秒
    vi.advanceTimersByTime(1001)
    expect(storage.get('TOKEN')).toBeNull()

    vi.useRealTimers()
  })

  it('存储异常时应能安全降级返回 fallback', () => {
    const brokenDriver: StorageDriver = {
      ...mockDriver,
      getItem: () => '{ invalid-json }',
    }
    const storage = createSafeStorage({ driver: brokenDriver })
    expect(storage.get('ANY', 'default')).toBe('default')
  })
})
