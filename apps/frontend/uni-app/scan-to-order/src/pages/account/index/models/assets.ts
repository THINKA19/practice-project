/** 演示资产摘要，金额单位为分，计数为非负安全整数。 */
export interface Assets {
  couponCount: number
  balanceCents: number
  points: number
  demo: true
}

/** 校验外部数据，不把缺失或无效字段转换为零。 */
export function parseAssets(value: unknown): Assets {
  if (!value || typeof value !== 'object')
    throw new Error('Invalid assets')
  const data = value as Record<string, unknown>
  for (const key of ['couponCount', 'balanceCents', 'points']) {
    if (typeof data[key] !== 'number' || !Number.isSafeInteger(data[key]) || data[key] < 0)
      throw new Error('Invalid assets')
  }
  if (data.demo !== true)
    throw new Error('Invalid asset source')
  return { couponCount: data.couponCount as number, balanceCents: data.balanceCents as number, points: data.points as number, demo: true }
}
