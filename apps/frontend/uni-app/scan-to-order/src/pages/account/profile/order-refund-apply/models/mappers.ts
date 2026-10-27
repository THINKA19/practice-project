import type { RefundLogisticsContent } from './types'

/** 解析售后寄回地址 JSON；缺失或解析失败返回 null，已解包的对象沿用原有兼容契约。 */
export function parseRefundLogisticsContent(raw: unknown): RefundLogisticsContent | null {
  if (!raw) {
    return null
  }

  if (typeof raw === 'object') {
    return raw as RefundLogisticsContent
  }

  try {
    const obj = JSON.parse(String(raw)) as unknown

    return obj && typeof obj === 'object' ? (obj as RefundLogisticsContent) : null
  }
  catch {
    return null
  }
}
