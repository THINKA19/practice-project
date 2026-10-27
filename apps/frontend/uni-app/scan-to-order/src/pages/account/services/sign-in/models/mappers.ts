import type { SignLog } from './types'

/** 校验日志响应，缺失数据不能冒充从未签到。 */
export function parseSignLogs(value: unknown): SignLog[] {
  if (!value || typeof value !== 'object' || !('result' in value) || !Array.isArray(value.result))
    throw new Error('签到记录格式无效')
  return value.result.map((item: unknown) => {
    if (!item || typeof item !== 'object' || !('id' in item) || typeof item.id !== 'number'
      || !('dateAdd' in item) || typeof item.dateAdd !== 'string'
      || !/^\d{4}-\d{2}-\d{2}(?:$|[ T])/.test(item.dateAdd)) {
      throw new Error('签到记录字段无效')
    }
    return { id: item.id, dateAdd: item.dateAdd }
  })
}
