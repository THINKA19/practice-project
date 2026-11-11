/**
 * ============================================================================
 * 【文件概述】领取唯一请求登记；本模块编排预览和领取，不复制赠送或资产状态。
 * 【方法与导出清单】default：预览和领取处理。
 * 【综合使用示例】
 * import entry from './entry.mock'
 * const routes = entry.data // => POST /card/share/fetch
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { owner, transferCard } from '../../gift-card/mock'
import { shareState } from '../../gift-card-send/mock'
import { logState } from '../../gift-card-logs/mock'

export default defineMock({
  [`[POST]${endpoints.shareFetch}`]: withFailure(({ headers, data }) => {
    const account = owner(headers.Authorization)
    const input = data as { id?: unknown, shareToken?: string, calculate?: boolean }
    if (typeof input.calculate !== 'boolean')
      return fail('领取操作标识无效')
    const share = shareState.get(input.shareToken || '')
    if (!share || share.expires < Date.now() || share.card.id !== Number(input.id))
      return fail('分享已失效或被领取')
    const result = { user: { nick: '演示赠送人' }, cardUser: { ...share.card }, cardInfo: { ...share.card.cardInfo, shareContent: share.remark } }
    if (input.calculate === true)
      return ok(result)
    if (share.owner === account)
      return fail('不能领取自己的赠送')
    const received = transferCard(share.owner, account, share.card.id)
    // 新持有人仅看到自己的领取事件，不泄露赠送方的历史备注。
    logState.replace(received.id, [])
    logState.record(received, 'receive', 'credit', received.amount, '领取好友赠送')
    shareState.remove(input.shareToken!)
    return ok(result)
  }, { write: true }),
})
