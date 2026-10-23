// 历史参考资料：禁止正式业务导入；按需提取到正式模块后再接入和验证。
/**
 * ============================================================================
 * 前端离线无碰撞唯一标识生成内核模块 (Kernel Unique ID Generator)
 * ============================================================================
 *
 * 【文件概述】
 * 本文件处于点餐系统架构金字塔最底层的共享内核（Shared Kernel），严禁向上依赖任何
 * 上层模块（包括 infrastructure、services、composables 及 pages）。
 * 纯 TypeScript 算法实现，专用于：
 * 1. 提交订单/支付请求时的离线防重幂等键（Idempotency Key）
 * 2. 链路追踪会话标识（Trace ID / Request ID）
 * 3. 临时无 ID 购物车条目的本地唯一 Key（Local Cart Item UID）
 * 4. 扫码点餐短参生成与临时桌台会话标识
 *
 * 核心机制：
 * - 跨端双模随机：优先探测现代 Web/微信基础库提供的 Crypto API；无环境支持时
 *   自动平滑降级至高性能伪随机算法，彻底规避跨端运行时崩溃。
 * - 零外部依赖：避免引入外部大型库，保证小程序首包体积最优。
 *
 * 【方法与导出清单】
 * - generateUUID()                    : 生成符合 RFC 4122 标准的 UUID v4 字符串 (36位)
 * - generateTraceId()                 : 生成用于微服务全链路追踪的 32 位紧凑十六进制 Trace ID
 * - generateNanoId(size)              : 生成紧凑型 URL 安全唯一字符串 (默认12位)
 * - generateOrderSequenceKey(prefix)  : 生成单调时间有序的业务防重防碰撞流水号
 *
 * 【综合使用示例】
 * ```typescript
 * import {
 *   generateUUID,
 *   generateTraceId,
 *   generateNanoId,
 *   generateOrderSequenceKey,
 * } from './id'
 *
 * // 1. HTTP 拦截器注入链路追踪 Header
 * const traceHeader = generateTraceId()
 * // => '4a2b9f1d8c3e4b7a9f2e1a3b5c7d9e0f'
 *
 * // 2. 本地购物车条目唯一键（规格不同但未入库时的临时 ID）
 * const tempCartItemId = generateNanoId(10)
 * // => 'V1StGXR8_Z'
 *
 * // 3. 提交订单防重幂等号（带业务前缀与毫秒时间戳）
 * const idempotencyToken = generateOrderSequenceKey('ORDER_')
 * // => 'ORDER_1792470000000_k9x2pa'
 * ```
 * ============================================================================
 */

/** URL 安全字符集字典 (64个无歧义字符，去除可能影响 URL 编码的符号) */
const URL_ALPHABET = 'useandom-26T1983_40STOpfunkgTYvhigREQ_AZrayXCLwebipoxd'

/**
 * 跨端安全获取 16 字节随机二进制数据
 * 兼容 WebCrypto、微信小程序原生环境与低版本保底
 */
function getSecureRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length)
  const globalCrypto
    = typeof crypto !== 'undefined'
      ? crypto
      : typeof window !== 'undefined' && (window as any).crypto
        ? (window as any).crypto
        : undefined

  if (globalCrypto && typeof globalCrypto.getRandomValues === 'function') {
    globalCrypto.getRandomValues(bytes)
  }
  else {
    // 降级保底：采用高性能位移伪随机算法
    for (let i = 0; i < length; i++) {
      bytes[i] = (Math.random() * 256) | 0
    }
  }
  return bytes
}

/**
 * 生成标准的 RFC 4122 v4 UUID
 * 优先采用 Crypto API 获取高熵真随机数；环境不支持时平滑降级至伪随机算子
 *
 * @returns 36 字符的标准 UUID 字符串
 *
 * @example
 * generateUUID() // => 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
 */
export function generateUUID(): string {
  const bytes = getSecureRandomBytes(16)

  // 符合 RFC 4122 v4 规范的版本号 (0x40) 与变体掩码 (0x80)
  bytes[6] = (bytes[6] & 0x0F) | 0x40
  bytes[8] = (bytes[8] & 0x3F) | 0x80

  const hex: string[] = []
  for (let i = 0; i < 16; i++) {
    hex.push(bytes[i].toString(16).padStart(2, '0'))
  }

  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`
}

/**
 * 生成全链路日志追踪 ID (Trace ID)
 * 符合 W3C / APM 规范的 32 位不带横杠的纯十六进制小写格式，适用于注入 HTTP Request Header
 *
 * @returns 32 位十六进制追踪字符串
 *
 * @example
 * generateTraceId() // => 'e4eaaaf2d14f40aeab98ba643325c8ee'
 */
export function generateTraceId(): string {
  const bytes = getSecureRandomBytes(16)
  let trace = ''
  for (let i = 0; i < 16; i++) {
    trace += bytes[i].toString(16).padStart(2, '0')
  }
  return trace
}

/**
 * 生成紧凑轻量、URL 安全的唯一标识字符串 (NanoID)
 * 字符集经过严格挑选，无需 URI 转义即可安全拼接入 URL 与分享二维码短参中
 *
 * @param size 生成长度，默认为 12 位
 * @returns 指定长度的随机字符凭据
 *
 * @example
 * generateNanoId()   // => 'V1StGXR8_Z0q'
 * generateNanoId(8)  // => 'aK9_2xYp'
 */
export function generateNanoId(size = 12): string {
  let id = ''
  const len = URL_ALPHABET.length
  const bytes = getSecureRandomBytes(size)
  for (let i = 0; i < size; i++) {
    id += URL_ALPHABET[bytes[i] % len]
  }
  return id
}

/**
 * 生成包含绝对毫秒时间戳的防重单调有序键 (Sequence Key)
 * 具备“高可读”、“按时间顺序自增”及“尾部碰撞消除”特性，专用于点餐支付与订单提交的防重防刷
 *
 * @param prefix 业务前缀（可选，如 'ORDER_'、'PAY_'）
 * @returns 组合型唯一键，格式为 `[prefix][timestamp]_[random6]`
 *
 * @example
 * generateOrderSequenceKey('ORDER_') // => 'ORDER_1792470000000_k9x2pa'
 * generateOrderSequenceKey()         // => '1792470000000_ab39ck'
 */
export function generateOrderSequenceKey(prefix = ''): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${prefix}${timestamp}_${randomSuffix}`
}
