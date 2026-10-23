// 历史参考资料：禁止正式业务导入；按需提取到正式模块后再接入和验证。
import { describe, expect, it, vi } from 'vitest'
import { createEventBus } from '../event-bus'

interface TestEvents {
  'cart:change': { count: number }
  'user:logout': void
}

describe('kernel Event Bus', () => {
  it.each(['clear', 'off'] as const)('旧取消函数不删除 %s 后注册的新监听', (method) => {
    const bus = createEventBus<TestEvents>()
    const unsubscribe = bus.on('cart:change', () => {})
    if (method === 'clear')
      bus.clear()
    else
      bus.off('cart:change')
    const handler = vi.fn()
    bus.on('cart:change', handler)
    unsubscribe()
    unsubscribe()
    bus.emit('cart:change', { count: 2 })
    expect(handler).toHaveBeenCalledOnce()
  })
  it('能正常发布与订阅事件', () => {
    const bus = createEventBus<TestEvents>()
    const handler = vi.fn()

    const unsubscribe = bus.on('cart:change', handler)
    bus.emit('cart:change', { count: 3 })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ count: 3 })

    unsubscribe()
    bus.emit('cart:change', { count: 4 })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('once 应该只触发一次并自动注销', () => {
    const bus = createEventBus<TestEvents>()
    const handler = vi.fn()

    bus.once('cart:change', handler)
    bus.emit('cart:change', { count: 1 })
    bus.emit('cart:change', { count: 2 })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ count: 1 })
  })

  it('clear 应该清空全部监听器', () => {
    const bus = createEventBus<TestEvents>()
    const h1 = vi.fn()
    const h2 = vi.fn()

    bus.on('cart:change', h1)
    bus.on('user:logout', h2)
    bus.clear()

    bus.emit('cart:change', { count: 1 })
    bus.emit('user:logout', undefined)

    expect(h1).not.toHaveBeenCalled()
    expect(h2).not.toHaveBeenCalled()
  })
})
