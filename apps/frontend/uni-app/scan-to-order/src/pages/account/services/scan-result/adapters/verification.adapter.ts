/** 页面接口适配：复用订单模块公开能力，响应转换归本模块模型。 */
import { scanApi } from '@/pages/pickup1/scan'
import { parseVerificationOrder } from '../models/mappers'
import type { VerificationOrder } from '../models/types'

export const verificationApi = {
  /**
   * 查询核销订单。
   * @param code 已归一化的核销码。
   * @returns 校验后的页面订单，请求失败或字段无效时抛错。
   * @example await verificationApi.detail('CODE')
   */
  async detail(code: string): Promise<VerificationOrder> {
    return parseVerificationOrder(await scanApi.detail(code))
  },
  /**
   * 确认核销；成功允许 data=null，缺失结果 undefined 不能当作成功。
   * @param code 当前已查询并核对的核销码。
   * @returns 服务端确认后完成，请求失败或结果缺失时抛错。
   * @example await verificationApi.confirm('CODE')
   */
  async confirm(code: string): Promise<void> {
    const result = await scanApi.verify(code)
    if (result === undefined)
      throw new Error('核销请求未完成')
  },
}
