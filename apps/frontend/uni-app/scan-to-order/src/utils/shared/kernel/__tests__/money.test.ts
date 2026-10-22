import { beforeEach, describe, expect, it } from 'vitest'
import {
  addMoney,
  formatMoney,
  fromMinorUnit,
  getCurrencyDecimals,
  getGlobalCurrency,
  mulMoney,
  setGlobalCurrency,
  subMoney,
  toMinorUnit,
} from '../money'

describe('kernel Money Service', () => {
  it('十进制临界值和负数使用中点远离零规则', () => {
    expect(toMinorUnit('1.255', 'CNY')).toBe(126)
    expect(toMinorUnit('1.005', 'CNY')).toBe(101)
    expect(toMinorUnit('-1.255', 'CNY')).toBe(-126)
    expect(toMinorUnit('1.005e1', 'CNY')).toBe(1005)
    expect(toMinorUnit('0.0049', 'CNY')).toBe(0)
    expect(() => toMinorUnit(Number.MAX_SAFE_INTEGER, 'CNY')).toThrow(RangeError)
  })

  it('称重数量相乘后按币种舍入，正负结果对称', () => {
    expect(mulMoney('1', 1.255, 'CNY')).toBe(1.26)
    expect(mulMoney('1', -1.255, 'CNY')).toBe(-1.26)
    expect(mulMoney('19.9', 0.125, 'CNY')).toBe(2.49)
    expect(mulMoney('25000', 0.125, 'VND')).toBe(3125)
  })
  beforeEach(() => {
    setGlobalCurrency('VND')
  })

  it('币种元数据与全局配置应生效', () => {
    expect(getGlobalCurrency()).toBe('VND')
    expect(getCurrencyDecimals('VND')).toBe(0)
    expect(getCurrencyDecimals('CNY')).toBe(2)
  })

  it('toMinorUnit 与 fromMinorUnit 应正确处理不同币种精度', () => {
    // 越南盾：0位小数，最小单位即自身
    expect(toMinorUnit(25000, 'VND')).toBe(25000)
    expect(fromMinorUnit(25000, 'VND')).toBe(25000)

    // 人民币：2位小数，最小单位为分
    expect(toMinorUnit(19.99, 'CNY')).toBe(1999)
    expect(fromMinorUnit(1999, 'CNY')).toBe(19.99)
  })

  it('高精度加法 addMoney 能杜绝 0.1 + 0.2 浮点误差', () => {
    setGlobalCurrency('CNY')
    expect(addMoney(0.1, 0.2)).toBe(0.3)
    expect(addMoney(10.5, '5.2', null, 2)).toBe(17.7)
  })

  it('高精度减法 subMoney 与乘法 mulMoney 准确性', () => {
    expect(subMoney(1.5, 1.2, 'CNY')).toBe(0.3)
    expect(subMoney(10000, 3000, 'VND')).toBe(7000)

    expect(mulMoney(19.9, 3, 'CNY')).toBe(59.7)
    expect(mulMoney(25000, 2, 'VND')).toBe(50000)
    expect(mulMoney(null, 2)).toBe(0)
  })

  it('formatMoney 金额格式化（千分位、小数位、货币符号）', () => {
    // 越南盾默认格式化
    expect(formatMoney(25000, { currency: 'VND' })).toBe('25,000')
    expect(formatMoney(25000, { currency: 'VND', symbol: '₫', symbolPosition: 'suffix' })).toBe('25,000 ₫')

    // 人民币默认格式化（补足2位小数）
    expect(formatMoney(1234.5, { currency: 'CNY', symbol: '¥' })).toBe('¥1,234.50')
    expect(formatMoney(0, { currency: 'CNY' })).toBe('0.00')

    // 非法值兜底
    expect(formatMoney(null, { currency: 'VND' })).toBe('0')
  })
})
