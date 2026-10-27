import { parseShareToken } from '../models/mappers'
import { cardRequests } from '../api/card.api'
import type { CardLog, CardTemplate, MyCard } from '../models/types'

/** 礼品卡业务门面：兼容空列表与分页响应，分享动作拒绝空凭证，预览和领取参数保持分离。 */
export const cardApi = {

  async list(data: Record<string, unknown> = {}): Promise<CardTemplate[]> {
    return (await cardRequests.list(data)) || []
  },

  async my(): Promise<MyCard[]> {
    return (await cardRequests.my()) || []
  },

  async logs(data: Record<string, unknown> = {}): Promise<{ result: CardLog[], totalPage?: number }> {
    return (await cardRequests.logs(data)) || { result: [] }
  },

  exchange(data: Record<string, unknown>) {
    return cardRequests.exchange(data)
  },

  shareOpen(data: Record<string, unknown>) {
    return cardRequests.shareOpen(data)
  },

  shareClose(data: Record<string, unknown>) {
    return cardRequests.shareClose(data)
  },

  shareFetch(data: Record<string, unknown>) {
    return cardRequests.shareFetch(data)
  },

  /** 开启赠送，返回分享 token（原 cardShareOpen，res.data 即 shareToken） */
  async openShare(id: number | string, remark = ''): Promise<string> {
    const res = await cardRequests.openShare(id, remark)

    return parseShareToken(res)
  },

  /** 领取赠送：calculate=true 仅预览（赠送人、卡信息），false 正式领取 */
  fetchShare(id: number | string, shareToken: string, calculate: boolean) {
    return cardRequests.fetchShare(id, shareToken, calculate)
  },
}
