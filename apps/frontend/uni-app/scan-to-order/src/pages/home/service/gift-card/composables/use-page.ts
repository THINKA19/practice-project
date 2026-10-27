import type { CardTemplate, MyCard } from '../models/types'
import { computed, ref } from 'vue'
import { cardApi } from './use-requests'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'
import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'
import { alert, showError } from '@/utils/project/interaction'

export const CARD_TAB_MY = 1
/** 卡片目录与个人卡包独立加载，页面切换不互相覆盖状态。 */
export function useCardPage() {
  const active = ref(0)
  const cardList = ref<CardTemplate[]>([])
  const cardMyList = ref<MyCard[]>([])
  const catalogLoading = ref(false)
  const mineLoading = ref(false)
  const catalogFailed = ref(false)
  const mineFailed = ref(false)
  const loading = computed(() => active.value === 0 ? catalogLoading.value : mineLoading.value)
  const failed = computed(() => active.value === 0 ? catalogFailed.value : mineFailed.value)
  let catalogRequest = 0
  let mineRequest = 0
  const scope = useSessionAccountScope(() => {
    catalogRequest++
    mineRequest++
    catalogLoading.value = false
    mineLoading.value = false
    mineFailed.value = false
    cardMyList.value = []
  })
  async function loadCatalog() {
    if (catalogLoading.value)
      return
    const ticket = scope.ticket()
    const request = ++catalogRequest
    catalogLoading.value = true
    catalogFailed.value = false
    try {
      const cards = await cardApi.list({ status: 0 })
      if (scope.current(ticket) && request === catalogRequest)
        cardList.value = cards
    }
    catch {
      if (scope.current(ticket) && request === catalogRequest)
        catalogFailed.value = true
    }
    finally {
      if (scope.current(ticket) && request === catalogRequest)
        catalogLoading.value = false
    }
  }
  async function loadMyCards() {
    if (mineLoading.value || !requireIdentity('customer'))
      return
    const ticket = scope.ticket()
    const request = ++mineRequest
    mineLoading.value = true
    mineFailed.value = false
    try {
      const cards = await cardApi.my()
      if (scope.current(ticket) && request === mineRequest)
        cardMyList.value = cards
    }
    catch {
      if (scope.current(ticket) && request === mineRequest)
        mineFailed.value = true
    }
    finally {
      if (scope.current(ticket) && request === mineRequest)
        mineLoading.value = false
    }
  }
  function refresh() {
    return active.value === 0 ? loadCatalog() : loadMyCards()
  }
  function init(query: { tab?: string } = {}) {
    active.value = query.tab === 'my' ? CARD_TAB_MY : 0
    uni.setNavigationBarTitle({ title: '礼品卡' })
    return refresh()
  }
  function tabChange(index: number) {
    if (index !== 0 && index !== CARD_TAB_MY)
      return
    active.value = index
    return refresh()
  }
  async function cardShareClose(item: MyCard) {
    if (!requireIdentity('customer'))
      return
    const ticket = scope.ticket()
    try {
      await cardApi.shareClose({ id: item.id })
      if (scope.current(ticket))
        await loadMyCards()
    }
    catch (error) {
      if (scope.current(ticket))
        showError(error)
    }
  }
  return {
    active,
    cardList,
    cardMyList,
    loading,
    failed,
    init,
    refresh,
    tabChange,
    cardShareClose,
    buy: (item: CardTemplate) => alert(`${item.name}\n在线购买暂未开放。可通过兑换码领取，或打开好友分享的赠送卡片领取。`),
    sendUser: (item: MyCard) => navigate(ClientRoutes.Home.cardSend, { cardId: item.id }),
    goExchange: () => navigate(ClientRoutes.Home.cardExchange),
    goLogs: (item: MyCard) => navigate(ClientRoutes.Home.cardLogs, { cardId: item.id }),
    shareAppMessage: () => ({ title: '礼品卡', path: ClientRoutes.Home.card }),
    shareTimeline: () => ({ title: '礼品卡' }),
  }
}
