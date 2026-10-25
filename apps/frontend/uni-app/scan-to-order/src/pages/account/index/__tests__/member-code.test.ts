import { describe, expect, it } from 'vitest'
import { code128Modules, encodeCode128 } from '@/pages/account/index'

describe('code128', () => {
  it('纯数字偶数位使用 Code C，校验位正确', () => {
    // START_C(105) + 12 + 34 → checksum = (105 + 12*1 + 34*2) % 103 = 82
    expect(encodeCode128('1234')).toEqual([105, 12, 34, 82, 106])
  })
  it('纯数字奇数位末位切换 Code B', () => {
    // 105 + 12*1 + 100*2 + ('3'-32=19)*3 = 374 % 103 = 65
    expect(encodeCode128('123')).toEqual([105, 12, 100, 19, 65, 106])
  })
  it('含字母使用 Code B', () => {
    // START_B(104) + 'A'(33)*1 = 137 % 103 = 34
    expect(encodeCode128('A')).toEqual([104, 33, 34, 106])
  })
  it('模块总宽 = 11*(n-1) + 13', () => {
    const codes = encodeCode128('1234')
    const total = code128Modules('1234').reduce((s, w) => s + w, 0)
    expect(total).toBe(11 * (codes.length - 1) + 13)
  })
  it('空串返回空', () => {
    expect(encodeCode128('')).toEqual([])
  })
})
