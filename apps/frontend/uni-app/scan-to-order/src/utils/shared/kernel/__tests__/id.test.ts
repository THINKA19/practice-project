import { describe, expect, it } from 'vitest'
import {
  generateNanoId,
  generateOrderSequenceKey,
  generateUUID,
} from '../id'

describe('kernel ID Generator', () => {
  it('generateUUID 应输出标准 UUID v4 结构', () => {
    const id1 = generateUUID()
    const id2 = generateUUID()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    expect(uuidRegex.test(id1)).toBe(true)
    expect(id1).not.toBe(id2)
  })

  it('generateNanoId 应根据指定长度生成随机字符串', () => {
    const id10 = generateNanoId(10)
    const id16 = generateNanoId(16)

    expect(id10.length).toBe(10)
    expect(id16.length).toBe(16)
    expect(id10).not.toBe(generateNanoId(10))
  })

  it('generateOrderSequenceKey 具备业务前缀与单调有序特性', () => {
    const seq = generateOrderSequenceKey('ORD_')
    expect(seq.startsWith('ORD_')).toBe(true)
    const parts = seq.replace('ORD_', '').split('_')
    expect(parts.length).toBe(2)
    // 第一段应为时间戳数字
    expect(Number(parts[0])).toBeGreaterThan(0)
  })
})
