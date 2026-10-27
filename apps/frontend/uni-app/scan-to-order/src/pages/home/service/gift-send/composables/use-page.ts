import type { MyCard } from '../../gift-card'
import { ref, watch } from 'vue'
import { cardApi } from '../../gift-card'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'
import { ClientRoutes } from '@/pages/routes'

import { showError } from '@/utils/project/interaction'
/** 通过 cardId 重新读取当前用户卡片，不在全局缓存另一账户的卡。 */
export function useGiftSendPage() {
  const cardUser = ref<MyCard | null>(null)

  const remark = ref('送您一份心意')

  const shareToken = ref('')

  const preparing = ref(false)
  let inputsRevision = 0
  let loadRequest = 0

  const scope = useSessionAccountScope(() => {
    inputsRevision++
    loadRequest++
    cardUser.value = null

    shareToken.value = ''

    preparing.value = false
    remark.value = '送您一份心意'
  })

  watch(remark, () => {
    inputsRevision++
    shareToken.value = ''
  }, { flush: 'sync' })

  async function init(query: {
    cardId?: string
  } = {}) {
    uni.setNavigationBarTitle({ title: '赠送礼品卡' })

    if (!requireIdentity('customer'))
      return

    const ticket = scope.ticket()
    const request = ++loadRequest
    inputsRevision++
    cardUser.value = null
    shareToken.value = ''

    try {
      const cards = await cardApi.my()

      if (scope.current(ticket) && request === loadRequest)
        cardUser.value = cards.find(card => String(card.id) === query.cardId) || null
    }
    catch (error) {
      if (scope.current(ticket) && request === loadRequest)
        showError(error)
    }
  }

  async function prepare() {
    if (preparing.value || !cardUser.value || !requireIdentity('customer'))
      return

    const ticket = scope.ticket()
    const inputTicket = inputsRevision
    const cardId = cardUser.value.id
    const message = remark.value

    preparing.value = true

    try {
      const token = await cardApi.openShare(cardId, message)

      if (!token)
        throw new Error('未取得分享凭证')

      // 编辑留言或重新选择卡片会清除本地分享凭证，迟到响应不能重新启用分享。
      if (scope.current(ticket) && inputTicket === inputsRevision)
        shareToken.value = token
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

  function shareAppMessage() {
    if (!cardUser.value || !shareToken.value)
      return { title: '礼品卡', path: ClientRoutes.Home.card }

    return { title: remark.value, path: `${ClientRoutes.Home.cardReceive}?id=${encodeURIComponent(cardUser.value.id)}&shareToken=${encodeURIComponent(shareToken.value)}`, imageUrl: cardUser.value.cardInfo?.pic }
  }

  return { cardUser, remark, shareToken, preparing, init, prepare, shareAppMessage }
}
