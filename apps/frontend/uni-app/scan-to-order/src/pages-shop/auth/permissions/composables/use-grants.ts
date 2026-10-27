/**
 * 【文件概述】查询服务端授权门店，参数与返回值在边界校验。
 * 【方法与导出清单】见下方具名导出。
 * 【综合使用示例】通过所属模块 index.ts 调用。
 */
import { merchantGrantRequests } from '../api/context.api'
import { isMerchantShop } from '../models/mappers'

/** 查询当前凭证所属门店并校验授权结构；缺少凭证或服务端资料无效时拒绝进入业务状态。 */
export async function fetchMerchantShops(token: string) {
  if (!token)
    throw new Error('请先登录商家账号')

  const result = await merchantGrantRequests.shops(token)

  if (!Array.isArray(result) || !result.every(isMerchantShop))
    throw new Error('门店授权资料无效')

  return result
}
/** 重新查询指定门店的授权；响应门店编号必须与请求一致，不能复用另一门店的权限。 */
export async function fetchMerchantGrant(token: string, shopId: string) {
  if (!token || !shopId)
    throw new Error('门店授权参数无效')

  const result = await merchantGrantRequests.grant(token, shopId)

  if (!isMerchantShop(result) || result.id !== shopId)
    throw new Error('门店授权资料无效')

  return result
}
