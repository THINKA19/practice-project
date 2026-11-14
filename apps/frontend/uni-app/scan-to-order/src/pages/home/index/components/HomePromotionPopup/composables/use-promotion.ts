import { ref, shallowRef, watch } from 'vue'
import type { Banner } from '../../../models/types'
import { fetchHomePromotion } from '../api/promotion.api'

const promotionSession = ref(0)
// 首页重新挂载时也要记住本轮已经展示过。
let lastPromotionSession = 0

/** 应用每次进入前台时开启新一轮首页广告展示。 */
export function beginHomePromotionSession() {
  promotionSession.value += 1
}

/** 管理当前首页实例的广告可见性。 */
export function useHomePromotion(isPageVisible: () => boolean) {
  const promotionVisible = ref(false)
  const promotion = shallowRef<Banner>()

  watch([promotionSession, isPageVisible], async ([session, visible], _, onCleanup) => {
    promotionVisible.value = false
    promotion.value = undefined
    if (!visible || session === 0 || session === lastPromotionSession)
      return

    let current = true
    onCleanup(() => {
      current = false
    })
    const banner = await fetchHomePromotion().catch(() => undefined)
    if (current && isPageVisible() && session === promotionSession.value)
      promotion.value = banner
  }, { immediate: true })

  function onPromotionLoad() {
    if (!promotion.value || !isPageVisible() || promotionSession.value === lastPromotionSession)
      return

    lastPromotionSession = promotionSession.value
    promotionVisible.value = true
  }

  function onPromotionError() {
    promotionVisible.value = false
    promotion.value = undefined
  }

  return { promotion, promotionVisible, onPromotionLoad, onPromotionError }
}
