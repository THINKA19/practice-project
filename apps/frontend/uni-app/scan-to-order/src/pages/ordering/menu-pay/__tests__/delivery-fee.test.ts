import { describe, expect, it } from 'vitest'
import { matchPeisongFee } from '../domain/payment.rules'

describe('配送费档位', () => {
  it('取第一个覆盖距离的档位', () => {
    const list = [{ id: 1, distance: 3 }, { id: 2, distance: 5 }]

    expect(matchPeisongFee(list, 2.5)?.id).toBe(1)

    expect(matchPeisongFee(list, 4)?.id).toBe(2)

    expect(matchPeisongFee(list, 6)).toBeUndefined()
  })
  it('接口档位乱序时选择最小覆盖档，不修改原列表，非法距离不报价', () => {
    const list = [{ id: 2, distance: 5 }, { id: 1, distance: 3 }]
    expect(matchPeisongFee(list, 2)?.id).toBe(1)
    expect(list[0].id).toBe(2)
    expect(matchPeisongFee(list, 0)?.id).toBe(1)
    expect(matchPeisongFee(list, -1)).toBeUndefined()
    expect(matchPeisongFee(list, Number.NaN)).toBeUndefined()
  })
})
