import { describe, expect, it } from 'vitest'
import { isShopOpened, parseScanScene, shopBusinessLabel, shopBusinessState, shopBusinessUnavailable } from '../domain/shop.rules'
import { toShop } from '../models/mappers'

describe('shop', () => {
  it('明确经营状态优先，缺失或未知字段不虚构正常营业', () => {
    expect(shopBusinessLabel({})).toBe('')
    expect(shopBusinessLabel({ openingState: 'new' })).toBe('')
    expect(shopBusinessState({ openingState: 'upcoming' })).toBe('upcoming')
    expect(shopBusinessState({ businessState: 'open', openingState: 'upcoming' })).toBe('open')
    for (const businessState of ['upcoming', 'suspended', 'resting'] as const)
      expect(shopBusinessUnavailable({ businessState })).toBe(true)
    expect(shopBusinessUnavailable({ businessState: 'open' })).toBe(false)
    expect(toShop({ id: 1, name: '门店', businessState: 'unknown' } as unknown as Parameters<typeof toShop>[0]).businessState).toBeUndefined()
  })
  const at = (h: number, m = 0) => new Date(2026, 9, 5, h, m)

  it('营业时间判断（含跨天）', () => {
    expect(isShopOpened('', at(3))).toBe(true)

    expect(isShopOpened('09:00-22:00', at(12))).toBe(true)

    expect(isShopOpened('09:00-22:00', at(23))).toBe(false)

    expect(isShopOpened('18:00-02:00', at(1))).toBe(true)

    expect(isShopOpened('18:00-02:00', at(12))).toBe(false)
  })

  it('解析扫码点餐 scene 两种格式', () => {
    expect(parseScanScene('shopId%3d36%2cid%3d111%2ckey%3dY6RoIT')).toEqual({ shopId: '36', id: '111', key: 'Y6RoIT' })

    expect(parseScanScene('1007292,1015,zsT1U3')).toEqual({ shopId: '1007292', id: '1015', key: 'zsT1U3' })

    expect(parseScanScene('abc')).toBeNull()
  })
})
