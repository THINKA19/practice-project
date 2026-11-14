import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { beginHomePromotionSession, useHomePromotion } from '../composables/use-promotion'
import { fetchHomePromotion } from '../api/promotion.api'

vi.mock('../api/promotion.api', () => ({ fetchHomePromotion: vi.fn() }))

describe('首页广告前台轮次', () => {
  beforeEach(() => vi.mocked(fetchHomePromotion).mockReset())

  it('同一轮切回首页不重弹，再次进入前台后重新展示', async () => {
    vi.mocked(fetchHomePromotion).mockResolvedValue({ id: 1, picUrl: '/promo.jpeg' })
    const pageVisible = ref(false)
    const scope = effectScope()
    try {
      const home = scope.run(() => useHomePromotion(() => pageVisible.value))!
      // 首页先显示时也要等应用开启前台轮次。
      pageVisible.value = true
      await nextTick()
      expect(home.promotionVisible.value).toBe(false)

      beginHomePromotionSession()
      await nextTick()
      expect(fetchHomePromotion).toHaveBeenCalledOnce()
      await vi.waitFor(() => expect(home.promotion.value?.picUrl).toBe('/promo.jpeg'))
      expect(home.promotionVisible.value).toBe(false)
      home.onPromotionLoad()
      expect(home.promotionVisible.value).toBe(true)
      home.promotionVisible.value = false

      pageVisible.value = false
      await nextTick()
      pageVisible.value = true
      await nextTick()
      expect(home.promotionVisible.value).toBe(false)

      pageVisible.value = false
      await nextTick()
      beginHomePromotionSession()
      await nextTick()
      expect(home.promotionVisible.value).toBe(false)
      pageVisible.value = true
      await nextTick()
      await vi.waitFor(() => expect(home.promotion.value?.picUrl).toBe('/promo.jpeg'))
      home.onPromotionLoad()
      expect(home.promotionVisible.value).toBe(true)

      pageVisible.value = false
      await nextTick()
      expect(home.promotionVisible.value).toBe(false)
      const reopenedHome = scope.run(() => useHomePromotion(() => pageVisible.value))!
      pageVisible.value = true
      await nextTick()
      expect(reopenedHome.promotionVisible.value).toBe(false)
      expect(fetchHomePromotion).toHaveBeenCalledTimes(2)
    }
    finally {
      scope.stop()
    }
  })
  it('组件在可见首页挂载时立即请求，隐藏后丢弃迟到结果', async () => {
    let resolvePromotion!: (promotion: { id: number, picUrl: string }) => void
    vi.mocked(fetchHomePromotion).mockReturnValueOnce(new Promise((resolve) => {
      resolvePromotion = resolve
    }))
    beginHomePromotionSession()
    const pageVisible = ref(true)
    const scope = effectScope()
    try {
      const home = scope.run(() => useHomePromotion(() => pageVisible.value))!
      expect(fetchHomePromotion).toHaveBeenCalledOnce()
      pageVisible.value = false
      resolvePromotion({ id: 2, picUrl: '/late.jpeg' })
      await nextTick()
      await nextTick()
      expect(home.promotion.value).toBeUndefined()
      expect(home.promotionVisible.value).toBe(false)
    }
    finally {
      scope.stop()
    }
  })
})
