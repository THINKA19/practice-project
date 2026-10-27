import type { CouponTemplate, MyCoupon } from './types'

/** 将不可信券记录收窄为普通对象；空值、数组及标量均视为协议错误。 */
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('优惠券数据格式错误')
  return value as Record<string, unknown>
}

/** 校验优惠券模板的标识、金额和适用范围，不把格式错误的数据展示为可领券。 */
export function parseCouponTemplate(value: unknown): CouponTemplate {
  const item = record(value)
  if (!Number.isSafeInteger(item.id) || typeof item.name !== 'string')
    throw new Error('优惠券数据格式错误')
  for (const field of ['moneyMin', 'moneyHreshold']) {
    if (typeof item[field] !== 'number' || !Number.isFinite(item[field]) || item[field] < 0)
      throw new Error('优惠券金额格式错误')
  }
  if (item.couponRefs !== undefined && (!Array.isArray(item.couponRefs) || item.couponRefs.some((ref) => {
    const entry = record(ref)
    return typeof entry.type !== 'number' || !['number', 'string'].includes(typeof entry.refId)
  }))) {
    throw new Error('优惠券适用范围格式错误')
  }
  return item as unknown as CouponTemplate
}

/** 解析可领取的优惠券模板分页。 */
export function parseCouponPage(value: unknown, mine: false): { list: CouponTemplate[], total?: number }

/** 解析当前顾客持有的优惠券分页，保留持有券编号与状态。 */
export function parseCouponPage(value: unknown, mine: true): { list: MyCoupon[], total?: number }

/** 兼容数组、list/result 分页；分别校验券模板或持有券的字段及总数。 */
export function parseCouponPage(value: unknown, mine: boolean): { list: (CouponTemplate | MyCoupon)[], total?: number } {
  if (value === null)
    return { list: [], total: 0 }
  const data: Record<string, unknown> = Array.isArray(value) ? { list: value } : record(value)
  const rows = data.list ?? data.result
  if (!Array.isArray(rows))
    throw new Error('优惠券列表格式错误')
  const list = rows.map((row) => {
    if (!mine)
      return parseCouponTemplate(row)
    const item = record(row)
    parseCouponTemplate({ ...item, moneyMin: item.money })
    if (!Number.isSafeInteger(item.pid) || !Number.isInteger(item.status))
      throw new Error('用户优惠券格式错误')
    return item as unknown as MyCoupon
  })
  const total = data.total ?? data.totalRow
  if (total !== undefined && (typeof total !== 'number' || !Number.isSafeInteger(total) || total < 0))
    throw new Error('优惠券分页格式错误')
  return { list, total: total as number | undefined }
}
