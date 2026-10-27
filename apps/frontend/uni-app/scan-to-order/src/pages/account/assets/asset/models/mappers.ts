import { parsePagedResponse } from '@/utils/project/paged-response'
import type { AssetPage, RechargeRule, UserAmount } from './types'

/** 校验资产边界值为普通对象，供各资产响应转换共用。 */
export function assetRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('资产数据格式错误')
  return value as Record<string, unknown>
}

/** 校验余额、冻结余额和积分均为有限非负数；无效字段不默认成零。 */
export function parseAssetAmount(value: unknown): UserAmount {
  const data = assetRecord(value)
  for (const key of ['balance', 'freeze', 'score']) {
    if (typeof data[key] !== 'number' || !Number.isFinite(data[key]) || data[key] < 0)
      throw new Error('资产数据格式错误')
  }
  return data as unknown as UserAmount
}

/** 将空套餐转换为空列表，校验套餐编号、门槛及赠送金额。 */
export function parseRechargeRules(value: unknown): RechargeRule[] {
  if (value === null)
    return []
  if (!Array.isArray(value))
    throw new Error('充值套餐格式错误')
  return value.map((item) => {
    const row = assetRecord(item)
    if (!Number.isSafeInteger(row.id) || typeof row.confine !== 'number' || !Number.isFinite(row.confine) || row.confine <= 0
      || typeof row.send !== 'number' || !Number.isFinite(row.send) || row.send < 0) {
      throw new Error('充值套餐格式错误')
    }
    return row as unknown as RechargeRule
  })
}

/** 钱包流水校验：记录编号、金额与记账时间必须有效。 */
export function parseAssetPage<T>(value: unknown, numericField: string): AssetPage<T> {
  return parsePagedResponse(value, (row) => {
    if (!Number.isSafeInteger(row.id) || typeof row[numericField] !== 'number' || !Number.isFinite(row[numericField]) || typeof row.dateAdd !== 'string')
      throw new TypeError('资产记录格式错误')
    return row as T
  })
}
