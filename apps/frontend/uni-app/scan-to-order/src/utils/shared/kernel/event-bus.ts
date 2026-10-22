/**
 * ============================================================================
 * 轻量类型安全事件总线内核模块 (Kernel Event Bus)
 * ============================================================================
 *
 * 【文件概述】
 * 本文件处于点餐系统架构金字塔最底层的共享内核（Shared Kernel），严禁向上依赖任何
 * 上层模块（包括 infrastructure、services、composables 及 pages）。
 * 本模块基于纯原生 Set/Map 数据结构实现，提供零外部依赖、带 TypeScript 泛型约束的
 * 发布-订阅（Publish-Subscribe）模式，用于实现跨组件、跨页面解耦通信。
 *
 * 【方法与接口清单】
 * - EventCallback<T>                  : 事件监听器函数签名
 * - EventBus<Events>                  : 事件总线接口规范
 * - createEventBus<Events>()          : 创建带强类型事件契约的事件总线实例
 *
 * 【综合使用示例】
 * ```typescript
 * import { createEventBus } from '@/utils/shared/kernel/event-bus'
 *
 * // 1. 定义事件契约映射类型
 * interface OrderEvents {
 *   'cart:updated': { totalCount: number; totalPrice: number }
 *   'order:created': { orderId: string }
 * }
 *
 * // 2. 创建实例
 * const bus = createEventBus<OrderEvents>()
 *
 * // 3. 监听事件（返回注销函数）
 * const unsubscribe = bus.on('cart:updated', (payload) => {
 *   console.log('购物车变动:', payload.totalCount)
 * })
 *
 * // 4. 派发事件
 * bus.emit('cart:updated', { totalCount: 2, totalPrice: 50000 })
 *
 * // 5. 注销监听
 * unsubscribe()
 * ```
 * ============================================================================
 */

/** 事件处理回调函数签名 */
export type EventCallback<T = unknown> = (payload: T) => void

/** 事件总线控制器接口 */
export interface EventBus<Events extends object> {
  /** 监听事件，返回解除该次监听的注销函数 */
  on: <K extends keyof Events>(event: K, handler: EventCallback<Events[K]>) => () => void
  /** 仅监听一次事件，触发后自动注销 */
  once: <K extends keyof Events>(event: K, handler: EventCallback<Events[K]>) => () => void
  /** 触发并派发事件 */
  emit: <K extends keyof Events>(event: K, payload: Events[K]) => void
  /** 手动注销指定事件的特定处理函数或全部处理函数 */
  off: <K extends keyof Events>(event: K, handler?: EventCallback<Events[K]>) => void
  /** 清空当前总线上的所有事件监听器 */
  clear: () => void
}

/**
 * 创建一个具备泛型类型约束的安全事件总线
 *
 * @template Events 键值映射字典，键为事件名字符串，值为对应的载荷（Payload）类型
 * @returns 具备发布-订阅能力的 EventBus 实例
 *
 * @example
 * interface GlobalEvents { 'auth:expired': void; 'store:changed': string }
 * const eventBus = createEventBus<GlobalEvents>()
 */
export function createEventBus<Events extends object = Record<string, unknown>>(): EventBus<Events> {
  const listenersMap = new Map<keyof Events, Set<EventCallback<any>>>()

  return {
    on<K extends keyof Events>(event: K, handler: EventCallback<Events[K]>): () => void {
      if (!listenersMap.has(event)) {
        listenersMap.set(event, new Set())
      }
      const set = listenersMap.get(event)!
      set.add(handler)

      return () => {
        set.delete(handler)
        if (set.size === 0 && listenersMap.get(event) === set) {
          listenersMap.delete(event)
        }
      }
    },

    once<K extends keyof Events>(event: K, handler: EventCallback<Events[K]>): () => void {
      const unsubscribe = this.on(event, ((payload: Events[K]) => {
        unsubscribe()
        handler(payload)
      }) as EventCallback<Events[K]>)

      return unsubscribe
    },

    emit<K extends keyof Events>(event: K, payload: Events[K]): void {
      const handlers = listenersMap.get(event)
      if (!handlers || handlers.size === 0) {
        return
      }
      // 拷贝副本执行，防止回调执行期间对 Set 的增删操作导致遍历异常
      const copy = Array.from(handlers)
      for (const fn of copy) {
        try {
          fn(payload)
        }
        catch (error) {
          console.error(`[EventBus] Error executing handler for event: "${String(event)}"`, error)
        }
      }
    },

    off<K extends keyof Events>(event: K, handler?: EventCallback<Events[K]>): void {
      if (!handler) {
        listenersMap.delete(event)
        return
      }
      const set = listenersMap.get(event)
      if (set) {
        set.delete(handler)
        if (set.size === 0) {
          listenersMap.delete(event)
        }
      }
    },

    clear(): void {
      listenersMap.clear()
    },
  }
}
