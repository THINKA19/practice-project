/**
 * ============================================================================
 * 商家前台订单提醒
 * ============================================================================
 *
 * 【文件概述】
 * 管理门店订单事件轮询、语音队列和可观察的订单变更。
 *
 * 【方法与导出清单】
 * - useMerchantNoticeStore：对商家页面提供提醒与订单更新信号。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useMerchantNoticeStore } from '@/pages-shop/shop/index'
 * const notices = useMerchantNoticeStore()
 * // 页面可以监听 notices.orderChangeVersion
 * ```
 * ============================================================================
 */
import { shopText as st } from '@/locale/shop-text'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { createPoller } from './composables/use-poller'
import { createCuePlayer } from './adapters/audio'
import { fetchMerchantEvents } from './api/events'
import { createReminderQueue } from './models/reminder'

const CUE_SOURCES = {
  'new-order': import.meta.env.VITE_SHOP_NEW_ORDER_AUDIO_URL || '/static/audio/notifications/incoming.wav',
  'ready': import.meta.env.VITE_SHOP_READY_AUDIO_URL || '/static/audio/notifications/ready.wav',
} as const

/**
 * 获取按门店隔离的前台事件与语音提醒 store。
 * @param 无参数。
 * @returns 提醒状态、订单变更版本及生命周期操作。
 * @example useMerchantNoticeStore().orderChangeVersion // => 当前实例的订单变更版本
 */
export const useMerchantNoticeStore = defineStore('merchant-notices', () => {
  const store = useMerchantShopStore()
  const ready = ref(false)
  const latest = ref('')
  const syncVersion = ref(0)
  const orderChangeVersion = ref(0)
  const audioError = ref('')
  const eventError = ref('')
  const player = createCuePlayer({ timeoutMs: 15000 })
  let cursor: number | undefined
  let foreground = false
  const queue = createReminderQueue()
  function stopAudio() {
    queue.clear()
    player.stop()
  }
  function fail() {
    stopAudio()
    audioError.value = '语音播放失败，请点击试听播报后重试'
  }
  function played() {
    audioError.value = ''
    next()
  }
  function next() {
    if (!foreground || !store.current?.soundNotify || player.playing)
      return
    const event = queue.next()
    if (!event)
      return
    player.play(CUE_SOURCES[event.kind], { onEnded: played, onFailed: fail })
  }
  const poller = createPoller(async (tick) => {
    try {
      if (!tick.active || !store.can('order.read'))
        return
      const context = store.capture('order.read')
      const result = await fetchMerchantEvents(context, cursor)
      if (!tick.active || !store.matches(context) || !store.can('order.read'))
        return
      eventError.value = ''
      const previousCursor = cursor ?? 0
      const firstSnapshot = cursor === undefined
      cursor = result.cursor
      ready.value = true
      if (firstSnapshot)
        return
      if (result.events.some(event => event.sequence > previousCursor))
        orderChangeVersion.value++
      for (const event of result.events) {
        if (!queue.push(event, true))
          continue
        latest.value = `${event.tableNo === '—' ? '' : `${event.tableNo} · `}${st(event.kind === 'new-order' ? '有新订单，请接单' : '餐品已出餐，请交付')}`
        if (!store.current?.soundNotify)
          queue.clear()
      }
      next()
    }
    catch {
      if (tick.active)
        eventError.value = '提醒刷新失败'
    }
    finally {
      if (tick.active)
        syncVersion.value++
    }
  }, 5000)
  function pause() {
    foreground = false
    poller.stop()
    stopAudio()
  }
  function resume() {
    pause()
    foreground = true
    poller.start()
  }
  watch(() => store.revision, () => {
    cursor = undefined
    ready.value = false
    queue.switchShop(store.current?.id || '')
    latest.value = ''
    audioError.value = ''
    eventError.value = ''
    stopAudio()
    if (!store.current)
      pause()
  }, { flush: 'sync', immediate: true })
  function preview() {
    if (!foreground || !store.can('order.read') || !store.current?.soundNotify || player.playing)
      return
    audioError.value = ''
    player.play(CUE_SOURCES['new-order'], { onEnded: played, onFailed: fail })
  }
  return { ready, latest, audioError, eventError, syncVersion, orderChangeVersion, preview, resume, pause }
})
