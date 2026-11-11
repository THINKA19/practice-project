import type { UserLevel } from './types'

/** 缺失的折扣或门槛显示为横杠；格式错误交由页面的重试状态处理。 */
export function parseMemberLevels(value: unknown): UserLevel[] {
  if (!Array.isArray(value))
    throw new Error('会员等级列表格式错误')
  return value.map((row: unknown) => {
    if (!row || typeof row !== 'object')
      throw new Error('会员等级格式错误')
    const { id, name, rebate, upgradeAmount } = row as Record<string, unknown>
    if (typeof id !== 'number' || !Number.isSafeInteger(id) || typeof name !== 'string' || !name.trim())
      throw new Error('会员等级格式错误')
    return { id, name, rebate: optionalAmount(rebate), upgradeAmount: optionalAmount(upgradeAmount) }
  })
}

function optionalAmount(value: unknown): number | undefined {
  if (value == null)
    return undefined
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    throw new Error('会员等级折扣或消费标准格式错误')
  return value
}
