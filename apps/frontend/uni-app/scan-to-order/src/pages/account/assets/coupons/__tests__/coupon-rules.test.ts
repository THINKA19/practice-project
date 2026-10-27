import { describe, expect, it } from 'vitest'
import { couponDateOnly, couponFetchErrorKey, couponUseTarget } from '..'

describe('marketing / coupon', () => {
  it('maps fetch error codes to i18n keys', () => {
    expect(couponFetchErrorKey(20001)).toBe('coupons.Cominglate')
    expect(couponFetchErrorKey(20002)).toBe('coupons.Cominglate')
    expect(couponFetchErrorKey(20003)).toBe('coupons.receivedgreedy')
    expect(couponFetchErrorKey(20004)).toBe('coupons.Expired')
    expect(couponFetchErrorKey(30001)).toBe('coupons.pointsinsufficient')
    expect(couponFetchErrorKey(500)).toBeNull()
  })

  it('resolves use target: menu / category first / goods / none', () => {
    expect(couponUseTarget(undefined)).toEqual({ kind: 'menu' })
    expect(couponUseTarget([])).toEqual({ kind: 'menu' })
    expect(couponUseTarget([{ type: 1, refId: 9 }, { type: 0, refId: 3 }])).toEqual({ kind: 'category', categoryId: 3 })
    expect(couponUseTarget([{ type: 1, refId: 9 }])).toEqual({ kind: 'goods', goodsId: 9 })
    expect(couponUseTarget([{ type: 2, refId: 1 }])).toEqual({ kind: 'none' })
  })

  it('keeps only date part', () => {
    expect(couponDateOnly('2024-01-02 10:00:00')).toBe('2024-01-02')
    expect(couponDateOnly(undefined)).toBeUndefined()
  })
})
