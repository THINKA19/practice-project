/**
 * ============================================================================
 * 【文件概述】门店上下文的唯一业务状态；公开选店通过 Pinia 持久化，扫码上下文不持久化凭证。
 * 【方法与导出清单】useShopStore：门店、配送方式、扫码上下文及受控更新。
 * 【综合使用示例】import { useShopStore } from '@/pages/ordering/index'; useShopStore().setPeisongType('zq')
 * ============================================================================
 */
import type { PeisongType, ScanDining, Shop } from './models/types'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { getSessionRevision } from '@/pages/auth/session'
import { shopCheckoutReason } from './domain/shop.rules'
import { shopApi } from './api/shop.api'
import { toShopDetail } from './models/mappers'
/** 校验持久化的公开门店快照。@param value 原始缓存。@returns 是否符合门店最小契约。@example validShop({ id: 1, name: '门店' }) // true */
function validShop(value: unknown): value is Shop {
  return !!value && typeof value === 'object' && 'id' in value && typeof value.id === 'number' && Number.isFinite(value.id) && 'name' in value && typeof value.name === 'string'
}
/** 获取跨页唯一门店状态。无参数。@returns 受控门店状态和命令。@example useShopStore().current */
export const useShopStore = defineStore('ordering-shop', () => {
  const current = ref<Shop | null>(null)
  const peisongType = ref<PeisongType>('zq')
  const scanDining = ref<ScanDining | null>(null)
  const goodsShopScope = ref('')
  let revision = 0
  watch(getSessionRevision, () => {
    scanDining.value = null
    revision++
  }, { flush: 'sync' })
  function setCurrent(shop: Shop | null) {
    revision++
    current.value = shop
    goodsShopScope.value = shop ? String(shop.id) : ''
  }
  function setPeisongType(value: PeisongType) {
    peisongType.value = value
  }
  function setScanDining(value: ScanDining | null) {
    scanDining.value = value
  }
  async function refreshCurrent() {
    const shop = current.value
    const ticket = revision
    if (!shop)
      return
    const response = await shopApi.detail(shop.id).then(toShopDetail)
    if (ticket === revision)
      setCurrent({ ...response.info, distance: shop.distance })
  }
  return { current, peisongType, scanDining, goodsShopScope, isOpened: computed(() => !shopCheckoutReason(current.value)), isScanMode: computed(() => !!scanDining.value), setCurrent, setPeisongType, setScanDining, refreshCurrent }
}, {
  persist: {
    key: `ordering-shop:${import.meta.env.MODE}`,
    paths: ['current', 'peisongType'],
    storage: { getItem: key => uni.getStorageSync(key) || null, setItem: (key, value) => uni.setStorageSync(key, value) },
    serializer: { serialize: JSON.stringify, deserialize: (raw) => {
      try {
        const state = JSON.parse(raw)
        return { current: validShop(state?.current) ? state.current : null, peisongType: state?.peisongType === 'kd' ? 'kd' : 'zq' }
      }
      catch {
        return { current: null, peisongType: 'zq' }
      }
    } },
  },
})
