/**
 * ============================================================================
 * 【文件概述】商品分享来源与立即购买草稿；不存凭证，身份变化立即清理。
 * 【方法与导出清单】useGoodsDraftStore：跨详情与结算共享的商品草稿。
 * 【综合使用示例】import { useGoodsDraftStore } from './store'; useGoodsDraftStore().referrer = '12'
 * ============================================================================
 */
import type { CartItem } from '@/pages/ordering/menu-cart'
import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { getSessionRevision } from '@/pages/auth/session'
/** 获取商品草稿。无参数。@returns 分享来源与立即购买商品。@example useGoodsDraftStore().buyNowGoods // [] */
export const useGoodsDraftStore = defineStore('ordering-goods-draft', () => {
  const referrer = ref('')
  const buyNowGoods = ref<CartItem[]>([])
  watch(getSessionRevision, () => {
    referrer.value = ''
    buyNowGoods.value = []
  }, { flush: 'sync' })
  return { referrer, buyNowGoods }
})
