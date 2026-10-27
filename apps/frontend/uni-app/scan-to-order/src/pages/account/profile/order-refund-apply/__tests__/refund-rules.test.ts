import { describe, expect, it } from 'vitest'
import { afterSaleTypes, clampRefundNumber, computeRefundAmount, refundImageList } from '../domain/refund-apply.rules'
import { parseRefundLogisticsContent } from '../models/mappers'

describe('refund rules（refund-apply）', () => {
  it('afterSale 解析', () => {
    expect(afterSaleTypes({ afterSale: '0,2' })).toEqual(['0', '2'])
    expect(afterSaleTypes({ afterSale: '' })).toEqual([])
    expect(afterSaleTypes(null)).toEqual([])
  })

  it('数量限制在 [1, max]', () => {
    expect(clampRefundNumber(0, 3)).toBe(1)
    expect(clampRefundNumber('', 3)).toBe(1)
    expect(clampRefundNumber(5, 3)).toBe(3)
    expect(clampRefundNumber(2, 3)).toBe(2)
  })

  it('售后金额：单价×数量，换货为 0', () => {
    expect(computeRefundAmount(0.1, 3, '0')).toBe(0.3)
    expect(computeRefundAmount(12.5, 2, '1')).toBe(25)
    expect(computeRefundAmount(12.5, 2, '2')).toBe(0)
  })

  it('寄回物流 JSON 解析', () => {
    expect(parseRefundLogisticsContent('{"linkMan":"B"}')?.linkMan).toBe('B')
    expect(parseRefundLogisticsContent('x')).toBeNull()
    expect(parseRefundLogisticsContent(undefined)).toBeNull()
  })

  it('举证图片保留上传返回的原始地址', () => {
    expect(refundImageList({ pics: [{ pic: 'https://images.test/a.jpg?token=1' }] })).toEqual(['https://images.test/a.jpg?token=1'])
    expect(refundImageList(null)).toEqual([])
  })
})
