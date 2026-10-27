import { RefundType } from '../models/enums'

/** 商品支持的售后类型列表（afterSale 为逗号分隔，如 "0,1,2"） */
export function afterSaleTypes(goods?: { afterSale?: string } | null): string[] {
  if (!goods?.afterSale) {
    return []
  }

  return goods.afterSale.split(',').map(s => s.trim()).filter(Boolean)
}

/** 判断商品是否声明了售后配置；不代替服务端的可申请校验。 */
export function supportsAfterSale(goods?: { afterSale?: string } | null): boolean {
  return !!goods?.afterSale
}

/** 售后数量限制在 [1, 购买数量]（原 numberChange） */
export function clampRefundNumber(n: number | string | null | undefined, max: number): number {
  let v = Math.floor(Number(n))

  if (!Number.isFinite(v) || v < 1) {
    v = 1
  }

  if (v > max) {
    v = max
  }

  return v
}

/** 售后金额：单价 × 数量；换货为 0（原 bindSave） */
export function computeRefundAmount(amountSingle: number | undefined, number: number, type: string): number {
  if (type === RefundType.EXCHANGE) {
    return 0
  }

  return Math.round((Number(amountSingle) || 0) * 100 * number) / 100
}

/** 使用上传接口返回的完整图片地址，不追加未约定的缩略图后缀。 */
export function refundImageList(rec?: { pics?: Array<{ pic: string }> } | null): string[] {
  return (rec?.pics || []).map(p => p.pic)
}
