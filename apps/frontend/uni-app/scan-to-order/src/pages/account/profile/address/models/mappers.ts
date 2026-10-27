import type { AddressDto } from '../api/address.dto'
import type { Address } from './types'

/** 后端历史默认标记可为字符串或数字，业务模型只保留布尔值。 */
export function normalizeAddress(row: AddressDto): Address {
  const flag = row.isDefault
  return { ...row, isDefault: flag === true || flag === 1 || flag === '1' || flag === 'true' }
}
