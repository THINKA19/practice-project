import type { CouponRef, CouponUseTarget, MyCoupon } from '../models/types'
import { CouponFetchCode } from '../models/enums'

/** 订单金额可用的优惠券 */
export function usableCoupons(list: MyCoupon[], orderAmount: number): MyCoupon[] {
  return list.filter(c => orderAmount >= (c.moneyHreshold || 0))
}

/** 领券失败码 → i18n key；未知错误返回 null（由调用方展示接口 msg） */
export function couponFetchErrorKey(code: number): string | null {
  switch (code) {
    case CouponFetchCode.SOLD_OUT:
    case CouponFetchCode.NOT_AVAILABLE:
      return 'coupons.Cominglate'
    case CouponFetchCode.RECEIVED:
      return 'coupons.receivedgreedy'
    case CouponFetchCode.SCORE_NOT_ENOUGH:
      return 'coupons.pointsinsufficient'
    case CouponFetchCode.EXPIRED:
      return 'coupons.Expired'
    default:
      return null
  }
}

/** 根据券的适用范围确定分类或商品目标；无范围限制返回菜单，未知范围返回 none。 */
export function couponUseTarget(refs?: CouponRef[] | null): CouponUseTarget {
  if (!refs || refs.length === 0) {
    return { kind: 'menu' }
  }
  let categoryId: number | string | undefined
  let goodsId: number | string | undefined
  refs.forEach((r) => {
    if (r.type === 0) {
      categoryId = r.refId
    }
    if (r.type === 1) {
      goodsId = r.refId
    }
  })
  if (categoryId) {
    return { kind: 'category', categoryId }
  }
  if (goodsId) {
    return { kind: 'goods', goodsId }
  }
  return { kind: 'none' }
}

/** 截取日期部分（"2024-01-01 12:00:00" → "2024-01-01"） */
export function couponDateOnly(dateEnd?: string): string | undefined {
  return dateEnd ? dateEnd.split(' ')[0] : dateEnd
}
