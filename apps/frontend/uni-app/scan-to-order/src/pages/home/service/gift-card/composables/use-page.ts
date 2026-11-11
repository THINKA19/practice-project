/**
 * ============================================================================
 * 【文件概述】卡包页面编排，连接列表、卡片操作与子页面导航。
 * 【方法与导出清单】useCardPage：创建卡包页面状态与操作。
 * 【综合使用示例】
 * import { useCardPage } from './composables/use-page'
 * const page = useCardPage() // 创建卡包页面状态
 * ============================================================================
 */
import { giftReceivePath, giftReceiveUrl, HomeServiceRoutes } from '../../routes'
import type { CardTemplate, MyCard } from '../models/types'
import { computed, ref } from 'vue'
import { cardApi } from './use-requests'
import { cardSendApi } from '../../gift-card-send'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'
import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'
import { confirm, showError, toast } from '@/utils/project/interaction'
import { myCardState } from '../domain/card.rules'

import { bannerApi } from '@/pages/home/index'
import type { Banner } from '@/pages/home/index'
import { CARD_BUY_NEXT_ACTION_TYPE } from '../models/enums'

export const CARD_TAB_MY = 1
/** 卡片目录与个人卡包独立加载，页面切换不互相覆盖状态。 */
/**
 * 组装卡包页面。
 * @param 无参数。
 * @returns 卡包列表状态和页面操作。
 * @example const page = useCardPage() // 创建卡包页面状态
 */
export function useCardPage() {
  const active = ref(0)
  const banners = ref<Banner[]>([])
  const selectedCard = ref<CardTemplate | null>(null)
  const paymentShow = ref(false)
  const cancellingId = ref<number | null>(null)
  const cardList = ref<CardTemplate[]>([])
  const cardMyList = ref<MyCard[]>([])
  const visibleCount = ref(12)
  const visibleCards = computed(() => cardList.value.slice(0, visibleCount.value))
  const visibleMyCards = computed(() => cardMyList.value.slice(0, visibleCount.value))
  const hasMore = computed(() => visibleCount.value < (active.value === 0 ? cardList.value.length : cardMyList.value.length))
  let paymentTicket = 0
  const catalogLoading = ref(false)
  const mineLoading = ref(false)
  const catalogFailed = ref(false)
  const mineFailed = ref(false)
  const loading = computed(() => active.value === 0 ? catalogLoading.value : mineLoading.value)
  const failed = computed(() => active.value === 0 ? catalogFailed.value : mineFailed.value)
  let catalogRequest = 0
  let mineRequest = 0
  const scope = useSessionAccountScope(() => {
    paymentShow.value = false
    selectedCard.value = null
    cancellingId.value = null
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
  async function loadMyCards(force = false) {
    if ((!force && mineLoading.value) || !requireIdentity('customer'))
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
  const refreshing = ref(false)
  async function pullRefresh() {
    refreshing.value = true
    visibleCount.value = 12
    try {
      await refresh()
    }
    finally { refreshing.value = false }
  }
  function init(query: { tab?: string } = {}) {
    active.value = query.tab === 'my' ? CARD_TAB_MY : 0
    uni.setNavigationBarTitle({ title: '礼品卡' })
    const ticket = scope.ticket()
    void bannerApi.banners('card').then((rows) => {
      if (scope.current(ticket))
        banners.value = rows
    }).catch(() => {})
    return refresh()
  }
  function tabChange(index: number) {
    if (index !== 0 && index !== CARD_TAB_MY)
      return
    visibleCount.value = 12
    active.value = index
    return refresh()
  }
  async function cardShareClose(item: MyCard) {
    if (cancellingId.value !== null || myCardState(item) !== 'sharing' || !requireIdentity('customer'))
      return
    const ticket = scope.ticket()
    cancellingId.value = item.id
    try {
      const confirmed = await confirm({
        title: '撤回赠送',
        content: '撤回后，好友收到的领取链接或分享卡片将失效。',
        confirmText: '撤回',
      })
      if (!confirmed || !scope.current(ticket))
        return
      await cardSendApi.shareClose({ id: item.id })
      if (scope.current(ticket)) {
        await loadMyCards(true)
        if (scope.current(ticket))
          toast('已撤回赠送')
      }
    }
    catch (error) {
      if (scope.current(ticket))
        showError(error)
    }
    finally {
      if (scope.current(ticket))
        cancellingId.value = null
    }
  }
  function sendUser(item: MyCard) {
    return navigate(HomeServiceRoutes.cardSend, { cardId: item.id })
  }
  function shareAgain(item: MyCard) {
    if (cancellingId.value !== null || myCardState(item) !== 'sharing' || !requireIdentity('customer'))
      return
    // #ifdef H5
    if (item.shareToken) {
      const ticket = scope.ticket()
      const path = giftReceivePath(item.id, item.shareToken)
      const data = giftReceiveUrl(path, window.location.href, import.meta.env.VITE_APP_ROUTER_MODE, import.meta.env.VITE_APP_PUBLIC_BASE)
      uni.setClipboardData({
        data,
        showToast: false,
        success: () => {
          if (scope.current(ticket))
            toast('已复制领取链接，请发给好友')
        },
        fail: () => {
          if (scope.current(ticket))
            void sendUser(item)
        },
      })
      return
    }
    // #endif
    void sendUser(item)
  }
  const demoBusy = ref(false)
  async function demoPurchase(item: CardTemplate) {
    if (demoBusy.value || !requireIdentity('customer'))
      return
    const ticket = scope.ticket()
    demoBusy.value = true
    try {
      await cardApi.demoAction('purchase', item.id)
      if (scope.current(ticket)) {
        active.value = CARD_TAB_MY
        await loadMyCards(true)
        toast('演示卡已入卡包，未发生支付')
      }
    }
    catch (error) {
      if (scope.current(ticket))
        showError(error)
    }
    finally { demoBusy.value = false }
  }
  function buy(item: CardTemplate) {
    if (paymentShow.value || !requireIdentity('customer'))
      return
    if (!Number.isFinite(item.price) || Number(item.price) <= 0) {
      toast('该礼品卡暂不可购买，请联系客服')
      return
    }
    paymentTicket = scope.ticket()
    selectedCard.value = { ...item }
    paymentShow.value = true
  }
  async function paymentOk() {
    if (!scope.current(paymentTicket))
      return
    paymentShow.value = false
    active.value = CARD_TAB_MY
    visibleCount.value = 12
    await loadMyCards(true)
  }
  return {
    refreshing,
    pullRefresh,
    demoBusy,
    demoPurchase,
    cancellingId,
    banners,
    tapBanner: async (url?: string) => {
      if (!url)
        return
      if (!url.startsWith('/pages/')) {
        toast('暂不支持此链接')
        return
      }
      const result = await navigate(url)
      if (!result.ok)
        toast('页面暂时无法打开')
    },
    selectedCard,
    paymentShow,
    paymentOk,
    nextAction: computed(() => selectedCard.value ? { type: CARD_BUY_NEXT_ACTION_TYPE, id: selectedCard.value.id } : undefined),
    visibleCards,
    visibleMyCards,
    hasMore,
    loadMore: () => { visibleCount.value += 12 },
    active,
    cardList,
    cardMyList,
    loading,
    failed,
    init,
    refresh,
    tabChange,
    cardShareClose,
    buy,
    sendUser,
    shareAgain,
    goExchange: async () => {
      const result = await navigate(HomeServiceRoutes.cardExchange)
      if (!result.ok)
        toast('暂时无法打开兑换页面，请重试')
    },
    goReceive: async () => {
      const result = await navigate(HomeServiceRoutes.cardReceive)
      if (!result.ok)
        toast('暂时无法打开领取页面，请重试')
    },
    goLogs: (item: MyCard, section?: 'details' | 'records') => navigate(HomeServiceRoutes.cardLogs, section ? { cardId: item.id, section } : { cardId: item.id }),
    shareAppMessage: () => ({ title: '礼品卡', path: ClientRoutes.Home.card }),
    shareTimeline: () => ({ title: '礼品卡' }),
  }
}
