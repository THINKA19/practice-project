import type { CouponTemplate, MyCoupon } from './types'

/** 将不可信券记录收窄为普通对象；空值、数组及标量均视为协议错误。 */
function readRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('优惠券数据格式错误')
  return value as Record<string, unknown>
}

/** 校验优惠券模板的标识、金额和适用范围，不把格式错误的数据展示为可领券。 */
export function parseCouponTemplate(value: unknown): CouponTemplate {
  const item = readRecord(value)
  validateCoupon(item, item.moneyMin)
  return item as unknown as CouponTemplate
}

function validateCoupon(item: Record<string, unknown>, amount: unknown) {
  if (!Number.isSafeInteger(item.id) || typeof item.name !== 'string')
    throw new Error('优惠券数据格式错误')
  for (const value of [amount, item.moneyHreshold]) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
      throw new Error('优惠券金额格式错误')
  }
  if (item.couponRefs !== undefined && (!Array.isArray(item.couponRefs) || item.couponRefs.some((ref) => {
    const entry = readRecord(ref)
    return typeof entry.type !== 'number' || !['number', 'string'].includes(typeof entry.refId)
  }))) {
    throw new Error('优惠券适用范围格式错误')
  }
}

/** 持有券使用 money 作为面额，pid 指向对应模板。 */
export function parseMyCoupon(value: unknown): MyCoupon {
  const item = readRecord(value)
  validateCoupon(item, item.money)
  if (!Number.isSafeInteger(item.pid) || !Number.isInteger(item.status))
    throw new Error('用户优惠券格式错误')
  if (item.dateEnd != null && typeof item.dateEnd !== 'string')
    throw new Error('优惠券有效期格式错误')
  return item as unknown as MyCoupon
}

/** 兼容数组及 list/result 分页，具体券记录由调用方指定解析器。 */
export function parseCouponPage<T>(value: unknown, parseItem: (row: unknown) => T): { list: T[], total?: number } {
  if (value === null)
    return { list: [], total: 0 }
  const data = Array.isArray(value) ? { list: value } : readRecord(value)
  const rows = data.list ?? data.result
  if (!Array.isArray(rows))
    throw new Error('优惠券列表格式错误')
  const total = data.total ?? data.totalRow
  if (total !== undefined && (typeof total !== 'number' || !Number.isSafeInteger(total) || total < 0))
    throw new Error('优惠券分页格式错误')
  return { list: rows.map(parseItem), total }
}
