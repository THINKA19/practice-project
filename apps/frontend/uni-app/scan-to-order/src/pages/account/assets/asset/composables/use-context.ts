import { getIdentity, getToken } from '@/pages/auth/session'

import { isAssetDemo } from '../api/endpoints'

export { isAssetDemo } from '../api/endpoints'

/**
 * 生成资产请求的顾客身份凭证；写请求必须登录，开发游客只允许读取样本。
 * @param write 是否为写入操作。
 * @returns 已校验的请求头；身份不符或缺少凭证时抛错。
 */
export function assetHeaders(write = false): Record<string, string> {
  const token = getToken()
  const identity = getIdentity()
  if (identity && identity !== 'customer')
    throw new Error('请使用顾客身份')
  if ((!isAssetDemo() || write) && (!token || identity !== 'customer'))
    throw new Error('请先登录')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
