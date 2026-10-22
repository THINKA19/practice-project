/**
 * ============================================================================
 * 键值存储抽象契约与安全容错内核模块 (Kernel Storage Service)
 * ============================================================================
 *
 * 【文件概述】
 * 本文件处于点餐系统架构金字塔最底层的共享内核（Shared Kernel），严禁向上依赖任何
 * 上层模块（包括 infrastructure、services、composables 及 pages）。
 * 本模块定义跨平台持久化（Storage Driver）核心契约，并提供纯逻辑层面的：
 * 1. 命名空间隔离（Namespace Key Prefix）
 * 2. 数据有效生命周期自销毁机制（TTL - Time To Live）
 * 3. JSON 序列化/反序列化安全包装与异常熔断
 *
 * 【方法与接口清单】
 * - StorageDriver                     : 底层平台物理读写抽象适配接口
 * - SafeStorageOptions                : 安全存储配置项（前缀、驱动）
 * - createSafeStorage(options)        : 组装高阶存储管理器实例
 *
 * 【综合使用示例】
 * ```typescript
 * import { createSafeStorage, StorageDriver } from '@/utils/shared/kernel/storage'
 *
 * // 1. 提供底层适配器（以纯内存/测试用 driver 为例，上层可注入 uni.getStorageSync 等）
 * const memoryDriver: StorageDriver = {
 *   getItem: (k) => memoryMap.get(k) ?? null,
 *   setItem: (k, v) => memoryMap.set(k, v),
 *   removeItem: (k) => memoryMap.delete(k),
 *   clear: () => memoryMap.clear(),
 *   keys: () => [...memoryMap.keys()],
 * }
 *
 * // 2. 构造带命名空间的安全存储
 * const appStorage = createSafeStorage({ driver: memoryDriver, prefix: 'APP_' })
 *
 * // 3. 存储带 2 小时有效期的对象（单位毫秒）
 * appStorage.set('STORE_CACHE', { storeId: 'S101' }, 2 * 60 * 60 * 1000)
 *
 * // 4. 读取对象（过期自动返回 null 并清理过期数据）
 * const cached = appStorage.get<{ storeId: string }>('STORE_CACHE')
 * ```
 * ============================================================================
 */

/** 平台存储适配器驱动接口（依赖倒置，底层不直接调用特定平台的 API） */
export interface StorageDriver {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
  clear: () => void
  /** 带前缀的 clear 必须通过此方法枚举已有键，包括之前实例写入的数据。 */
  keys?: () => string[]
}

/** 包装层元数据载荷结构 */
interface StorageEnvelope<T> {
  value: T
  /** 过期绝对时间戳（毫秒）；若无则为 null */
  expireAt: number | null
}

export interface SafeStorageOptions {
  /** 物理存储驱动实现 */
  driver: StorageDriver
  /** 键前缀命名空间，防止不同模块键冲突，默认 '' */
  prefix?: string
}

export interface SafeStorage {
  get: <T>(key: string, fallback?: T) => T | null
  set: <T>(key: string, value: T, ttlMs?: number) => boolean
  remove: (key: string) => void
  /** 空前缀清空整个驱动；有前缀仅清理匹配键。缺少 keys 或失败返回 false。 */
  clear: () => boolean
}

/**
 * 组装一个具备 TTL 过期控制与类型保护的安全存储对象
 *
 * @param options 配置参数，包含底层适配驱动与前缀命名空间
 * @returns SafeStorage 操作实例
 */
export function createSafeStorage(options: SafeStorageOptions): SafeStorage {
  const { driver, prefix = '' } = options

  function getRealKey(key: string): string {
    return `${prefix}${key}`
  }

  return {
    get<T>(key: string, fallback: T | null = null): T | null {
      const realKey = getRealKey(key)
      let raw: string | null = null

      try {
        raw = driver.getItem(realKey)
      }
      catch (err) {
        console.warn(`[SafeStorage] Failed to read key: ${realKey}`, err)
        return fallback
      }

      if (!raw) {
        return fallback
      }

      try {
        const envelope = JSON.parse(raw) as StorageEnvelope<T>

        // 校验数据结构有效性
        if (typeof envelope !== 'object' || envelope === null || !('value' in envelope)) {
          return fallback
        }

        // 检查过期时间
        if (typeof envelope.expireAt === 'number' && Date.now() > envelope.expireAt) {
          driver.removeItem(realKey)
          return fallback
        }

        return envelope.value
      }
      catch {
        // 反序列化失败（可能被外部写入了非 JSON 纯字符串），返回默认保底
        return fallback
      }
    },

    set<T>(key: string, value: T, ttlMs?: number): boolean {
      const realKey = getRealKey(key)
      const expireAt = typeof ttlMs === 'number' && ttlMs > 0 ? Date.now() + ttlMs : null

      const envelope: StorageEnvelope<T> = {
        value,
        expireAt,
      }

      try {
        const serialized = JSON.stringify(envelope)
        driver.setItem(realKey, serialized)
        return true
      }
      catch (err) {
        console.warn(`[SafeStorage] Failed to write key: ${realKey}`, err)
        return false
      }
    },

    remove(key: string): void {
      try {
        driver.removeItem(getRealKey(key))
      }
      catch (err) {
        console.warn(`[SafeStorage] Failed to remove key: ${key}`, err)
      }
    },

    clear(): boolean {
      try {
        if (!prefix) {
          driver.clear()
        }
        else {
          if (!driver.keys)
            return false
          for (const key of driver.keys()) {
            if (key.startsWith(prefix))
              driver.removeItem(key)
          }
        }
        return true
      }
      catch (err) {
        console.warn('[SafeStorage] Failed to clear storage', err)
        return false
      }
    },
  }
}
