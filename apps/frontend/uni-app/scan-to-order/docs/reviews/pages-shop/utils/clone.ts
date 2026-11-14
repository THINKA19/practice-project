/**
 * mock 数据 / 表单初始值的深拷贝
 *
 * 不用 structuredClone：微信小程序等端的基础库不保证提供该 API，
 * 直接调用会在真机上抛 "structuredClone is not defined"。
 * 这里手写递归拷贝，纯数据对象（mock 数据）语义一致，且保留 undefined 字段。
 */
export function clonePlain<T>(value: T): T {
  if (value === null || typeof value !== 'object')
    return value

  if (Array.isArray(value))
    return value.map(item => clonePlain(item)) as unknown as T

  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>))
    result[key] = clonePlain(val)

  return result as T
}
