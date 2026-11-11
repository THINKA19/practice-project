/**
 * ============================================================================
 * 【文件概述】
 * 礼品卡赠送领域业务编排层；通过礼品卡和会话公开入口访问数据，隔离账号切换后的迟到响应。
 *
 * 【方法与导出清单】
 * useGiftSendPage()：创建本页独立状态与业务操作。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useGiftSendPage } from '@/pages/home/service/gift-card-send'
 * // 在 Vue setup 中调用，作用域销毁时释放会话监听。
 * const page = useGiftSendPage()
 * await page.init({ cardId: '7' }) // => 查询当前账号卡包
 * await page.prepare() // => 服务端确认后取得分享凭证
 * ```
 * ============================================================================
 */
import { ClientRoutes } from '@/pages/routes'
import { giftReceivePath } from '../../routes'
import type { MyCard } from '../../gift-card'
import { ref, watch } from 'vue'
import { cardApi, myCardState } from '../../gift-card'
import { cardSendApi } from '../api/send.api'
import { parseShareToken } from '../models/mappers'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'

import { showError } from '@/utils/project/interaction'
/**
 * 装配礼品卡赠送的响应式状态与操作。
 * 无参数；须在 Vue setup 或响应式作用域内调用。
 * @returns 独立的响应式状态和操作方法；请求失败由页面状态或交互提示表达。
 * @example const page = useGiftSendPage() // => 初始状态独立，尚未发起请求
 */
export function useGiftSendPage() {
  const cardUser = ref<MyCard | null>(null)

  const remark = ref('送您一份心意')

  const shareToken = ref('')
  const shareTitle = ref('')

  const preparing = ref(false)
  const loading = ref(false)
  const failed = ref(false)
  let inputsRevision = 0
  let loadRequest = 0
  let currentCardId = ''

  const scope = useSessionAccountScope(() => {
    inputsRevision++
    loadRequest++
    cardUser.value = null

    shareToken.value = ''

    preparing.value = false
    loading.value = false
    failed.value = false
    remark.value = '送您一份心意'
  })

  watch(remark, () => {
    inputsRevision++
    shareToken.value = ''
  }, { flush: 'sync' })

  /**
   * 校验卡号并从当前账号卡包加载可展示的卡片。
   * @param query { cardId?: string }；正安全整数持卡编号。
   * @returns Promise<void>；失败设置 failed，旧请求不覆盖新卡片。
   * @example
   * await page.init({ cardId: '7' }) // => 本人持卡时更新 cardUser
   */
  async function init(query: {
    cardId?: string
  } = {}) {
    uni.setNavigationBarTitle({ title: '赠送礼品卡' })
    currentCardId = query.cardId || ''

    if (!requireIdentity('customer'))
      return

    const ticket = scope.ticket()
    const request = ++loadRequest
    inputsRevision++
    cardUser.value = null
    shareToken.value = ''

    if (!/^\d+$/.test(currentCardId) || !Number.isSafeInteger(Number(currentCardId)) || Number(currentCardId) <= 0) {
      loading.value = false
      failed.value = false
      return
    }

    loading.value = true
    failed.value = false
    try {
      const cards = await cardApi.my()

      if (scope.current(ticket) && request === loadRequest) {
        const card = cards.find(card => String(card.id) === query.cardId) || null
        cardUser.value = card
        if (card && myCardState(card) === 'sharing') {
          shareToken.value = card.shareToken || ''
          shareTitle.value = card.cardInfo?.name || '好友赠送的礼品卡'
        }
      }
    }
    catch (error) {
      if (scope.current(ticket) && request === loadRequest) {
        failed.value = true
        showError(error)
      }
    }
    finally {
      if (scope.current(ticket) && request === loadRequest)
        loading.value = false
    }
  }

  /**
   * 为当前卡片和留言申请分享凭证。
   * 无参数。
   * @returns Promise<void>；失败提示，留言或卡片变化后丢弃旧凭证。
   * @example
   * await page.prepare() // => 服务端返回有效凭证后允许分享
   */
  async function prepare() {
    if (preparing.value || !cardUser.value || !['canShare', 'sharing'].includes(myCardState(cardUser.value)) || !requireIdentity('customer'))
      return

    const ticket = scope.ticket()
    const inputTicket = inputsRevision
    const cardId = cardUser.value.id
    const message = remark.value

    preparing.value = true

    try {
      const token = parseShareToken(await cardSendApi.openShare({ id: cardId, remark: message }))

      if (!token)
        throw new Error('未取得分享凭证')

      // 编辑留言或重新选择卡片会清除本地分享凭证，迟到响应不能重新启用分享。
      if (scope.current(ticket) && inputTicket === inputsRevision) {
        shareToken.value = token
        shareTitle.value = message.trim() || '好友赠送的礼品卡'
      }
    }
    catch (error) {
      if (scope.current(ticket) && inputTicket === inputsRevision)
        showError(error)
    }
    finally {
      if (scope.current(ticket))
        preparing.value = false
    }
  }

  /**
   * 使用当前卡号重试加载卡片。
   * 无参数。
   * @returns Promise<void>；清除旧凭证并重新查询卡包。
   * @example
   * await page.retry() // => 重新加载当前卡片
   */
  function retry(): Promise<void> {
    return init({ cardId: currentCardId })
  }

  /**
   * 同步生成微信好友分享内容。
   * 无参数。
   * @returns 分享标题、路径及可选封面；无凭证时退回普通卡包路径。
   * @example
   * page.shareAppMessage() // => 无凭证时不包含 shareToken
   */
  function shareAppMessage() {
    if (!cardUser.value || !shareToken.value)
      return { title: '礼品卡', path: ClientRoutes.Home.card }

    return { title: shareTitle.value, path: giftReceivePath(cardUser.value.id, shareToken.value), imageUrl: cardUser.value.cardInfo?.pic }
  }

  return { cardUser, remark, shareToken, preparing, loading, failed, init, retry, prepare, shareAppMessage }
}
