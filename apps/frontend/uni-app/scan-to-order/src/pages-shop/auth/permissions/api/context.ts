/**
 * 【文件概述】查询服务端授权门店，参数与返回值在边界校验。
 * 【方法与导出清单】见下方具名导出。
 * 【综合使用示例】通过所属模块 index.ts 调用。
 */
import { http } from '@/http/http'
import { isMerchantShop } from '../models/context'
import { permissionEndpoint } from './endpoints'

export async function fetchMerchantShops(token: string) {
  if (!token)
    throw new Error('请先登录商家账号')

  const result = await http.get<unknown>(permissionEndpoint('SHOPS'), undefined, { Authorization: `Bearer ${token}` })

  if (!Array.isArray(result) || !result.every(isMerchantShop))
    throw new Error('门店授权资料无效')

  return result
}
export async function fetchMerchantGrant(token: string, shopId: string) {
  if (!token || !shopId)
    throw new Error('门店授权参数无效')

  const result = await http.get<unknown>(permissionEndpoint('GRANT'), { shopId }, { Authorization: `Bearer ${token}` })

  if (!isMerchantShop(result) || result.id !== shopId)
    throw new Error('门店授权资料无效')

  return result
}
