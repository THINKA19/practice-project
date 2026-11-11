/**
 * ============================================================================
 * 【文件概述】卡包业务查询门面，归一化空列表；子领域请求已迁回所属目录。
 * 【方法与导出清单】cardApi：list、my、demoAction。
 * 【综合使用示例】
 * import { cardApi } from '@/pages/home/service/gift-card'
 * const cards = await cardApi.my() // => 空数据时返回 []
 * ============================================================================
 */
import { cardRequests } from '../api/card.api'
import type { CardTemplate, MyCard } from '../models/types'

export const cardApi = {
  /** 开发资产动作，参数及限制见 cardRequests.demoAction。 */
  demoAction: cardRequests.demoAction,
  /**
   * 查询模板并归一化空结果。
   * @param data { status?: number }；可选状态筛选。
   * @returns Promise<CardTemplate[]>；请求失败拒绝。
   * @example await cardApi.list() // => 模板数组或 []
   */
  async list(data: { status?: number } = {}): Promise<CardTemplate[]> {
    return (await cardRequests.list(data)) || []
  },
  /**
   * 查询当前客户持卡并归一化空结果。
   * 无参数。
   * @returns Promise<MyCard[]>；请求失败拒绝。
   * @example await cardApi.my() // => 持卡数组或 []
   */
  async my(): Promise<MyCard[]> {
    return (await cardRequests.my()) || []
  },
}
