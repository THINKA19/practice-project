/**
 * ============================================================================
 * 【文件概述】商品详情 / composables/use-sku-selector.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - SkuSelectorDeps：数据类型契约。
 * - useGoodsDetailSkuSelector：本文件对外声明。
 * 【综合使用示例】
 * import type { SkuSelectorDeps } from '@/pages/ordering/menu-goods-details/composables/use-sku-selector'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
import { catalogApi, needsLogin, useOrderingLocale as useI18n, useOrderingSkuSelection } from '@/pages/ordering/menu'
/**
 * 商品详情 - 规格/加料/时段选择、价格计算、数量、加入购物车 ViewModel
 * 来源：bee-master/pages/goods-details/index.js
 *   _goodsTimesSchedule、goodsAddition、bindGuiGeTap、closePopupTap、stepChange、
 *   labelItemTap、labelItemTap2、skuClick3、calculateGoodsPrice、addShopCar
 * 选择、询价、计价由 goods 领域的 useOrderingSkuSelection 引擎完成；这里维护弹窗、数量与加购/砍价交互。
 */
import type { Ref } from 'vue'
import type { AdditionGroup, AdditionItem, GoodsDetail, PropertyChild } from '@/pages/ordering/menu'
import { useCartStore } from '@/pages/ordering/menu-cart'
import { requireIdentity } from '@/pages/auth/session'
import { showError, toast } from '@/utils/project/interaction'
import { navigate as go } from '@/utils/project/navigation'

import { ClientRoutes } from '@/pages/routes'
import { useShopCheckoutAvailability } from '@/pages/ordering/index'

/**
 * SkuSelectorDeps 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：detail、isKanjiaOwner、kanjiaId、reload；必填与可选字段见声明。
 * @example
 * import type { SkuSelectorDeps } from '@/pages/ordering/menu-goods-details/composables/use-sku-selector'
 * declare const response: SkuSelectorDeps
 * const value: SkuSelectorDeps = response // => 保留 SkuSelectorDeps 的字段与取值约束
 */
export interface SkuSelectorDeps {
  detail: Ref<GoodsDetail | null>
  /** 当前用户是砍价发起人：加购前清空购物车，加购后去下单 */
  isKanjiaOwner: Ref<boolean>
  kanjiaId: () => number | undefined
  /** 登录失效重新登录后刷新页面 */
  reload: () => Promise<void>
}

/**
 * 创建 use-sku-selector 对应的领域状态与交互能力。
 * @param deps {SkuSelectorDeps} 调用方提供的状态与业务动作。
 * @returns 对象，包含 sel、additions、schedule、showPopup、selectSizePrice、selectSizeOPrice、totalScoreToPay、buyNumber、buyNumMin、buyNumMax、skuGoodsPic、hasMoreSelect、canSubmit、applyDetail、loadAdditions、loadSchedule、calculate、openPopup、closePopup、stepChange、selectProperty、toggleAddition、selectTime、isPropActive、isAdditionActive、isTimeActive、addShopCar。
 * @example
 * import { useGoodsDetailSkuSelector } from '@/pages/ordering/menu-goods-details/composables/use-sku-selector'
 * declare const deps: Parameters<typeof useGoodsDetailSkuSelector>[0]
 * useGoodsDetailSkuSelector(deps) // => 对象，包含 sel、additions、schedule、showPopup、selectSizePrice、selectSizeOPrice、totalScoreToPay、buyNumber、buyNumMin、buyNumMax、skuGoodsPic、hasMoreSelect、canSubmit、applyDetail、loadAdditions、loadSchedule、calculate、openPopup、closePopup、stepChange、selectProperty、toggleAddition、selectTime、isPropActive、isAdditionActive、isTimeActive、addShopCar
 */
export function useGoodsDetailSkuSelector(deps: SkuSelectorDeps) {
  const { t } = useI18n()

  const cartStore = useCartStore()
  const availability = useShopCheckoutAvailability()

  const { detail } = deps

  const sku = useOrderingSkuSelection({ detail })

  const { selection: sel, additions, schedule } = sku

  const showPopup = ref(false)

  const selectSizePrice = ref(0)

  const selectSizeOPrice = ref(0)

  const totalScoreToPay = ref(0)

  const buyNumber = ref(0)

  const buyNumMin = 1

  const buyNumMax = ref(0)

  const skuGoodsPic = ref('')

  const submitting = ref(false)

  const hasProperties = computed(() => !!detail.value?.properties?.length)
  /** 原 hasMoreSelect：有规格或有加料 */

  const hasMoreSelect = computed(() => hasProperties.value || !!additions.value?.length)
  /** 原 canSubmit：规格已选全（详情页询价不要求时段） */

  const canSubmit = computed(() => hasProperties.value && sku.isPropertiesComplete(false))

  /** 详情加载完成后的初始价格与数量 */

  function applyDetail(d: GoodsDetail) {
    const b = d.basicInfo

    selectSizePrice.value = b.minPrice

    selectSizeOPrice.value = b.originalPrice

    totalScoreToPay.value = b.minScore || 0

    buyNumMax.value = b.stores

    buyNumber.value = b.stores > 0 ? 1 : 0

    skuGoodsPic.value = b.pic
  }

  /** 可选配件（原 goodsAddition） */

  async function loadAdditions(goodsId: string | number) {
    additions.value = await catalogApi.goodsAddition(goodsId).catch(() => null)
  }

  /** 时段定价（原 _goodsTimesSchedule）：默认选中第一天第一个时段 */

  async function loadSchedule() {
    const d = detail.value

    if (!d) {
      return
    }

    const res = await catalogApi.timesSchedule(d.basicInfo.id, '').catch(() => null)

    sku.setSchedule(res)

    if (res && res.length)
      await calculate()
  }

  /** 计算最终价格（原 calculateGoodsPrice）：基础价 → SKU 价 → 时段价 → +配件价 */

  async function calculate() {
    const d = detail.value

    if (!d) {
      return
    }
    // 已有更新的计算请求时丢弃过期结果

    if (!(await sku.requote(canSubmit.value)))
      return

    const q = sku.quote.value

    if (!q)
      return

    selectSizePrice.value = q.price

    selectSizeOPrice.value = q.originalPrice

    totalScoreToPay.value = q.score

    buyNumMax.value = q.maxBuy

    const min = d.basicInfo.minBuyNumber || 1

    buyNumber.value = q.maxBuy >= min ? min : 0
  }

  /** 打开规格弹窗（原 bindGuiGeTap / toAddShopCar） */

  async function openPopup() {
    const d = detail.value

    if (!d) {
      return
    }

    showPopup.value = true

    selectSizePrice.value = d.basicInfo.minPrice

    selectSizeOPrice.value = d.basicInfo.originalPrice

    skuGoodsPic.value = d.basicInfo.pic

    await loadSchedule()
  }

  function closePopup() {
    showPopup.value = false
  }

  function stepChange(value: number | string) {
    const n = Number(value)

    buyNumber.value = Number.isFinite(n) ? n : 0
  }

  /** 选择规格（原 labelItemTap） */

  function selectProperty(propertyId: number, child: PropertyChild) {
    const d = detail.value

    if (!d) {
      return
    }

    sku.chooseProperty(propertyId, child.id)

    const subPic = (d.subPics || []).find(p => p.optionValueId === child.id)

    if (subPic) {
      skuGoodsPic.value = subPic.pic
    }

    calculate()
  }

  /** 选择配件（原 labelItemTap2）：再次点击取消，单选组互斥 */

  function toggleAddition(group: AdditionGroup, item: AdditionItem) {
    sku.chooseAddition(group, item)

    calculate()
  }

  /** 选择时段（原 skuClick3）：无库存提示 */

  function selectTime(dayIndex: number, slotIndex: number) {
    const result = sku.chooseTime(dayIndex, slotIndex)

    if (result === 'noStores')
      toast(t('goodsDetail.noStores'))

    if (result === 'ok')
      calculate()
  }

  /** 加入购物车 / 砍价购买（原 addShopCar） */

  async function addShopCar() {
    const d = detail.value

    if (!d || submitting.value) {
      return
    }

    if (hasProperties.value && !canSubmit.value) {
      toast(t('goodsDetail.noSelectSku'))

      openPopup()

      return
    }

    if (additions.value && !sku.isAdditionsComplete()) {
      toast(t('goodsDetail.noSelectAddtion'))

      openPopup()

      return
    }

    if (buyNumber.value < 1) {
      toast(t('goodsDetail.noSelectNumber'))

      return
    }

    if (!(requireIdentity('customer'))) {
      return
    }

    submitting.value = true

    try {
      const isKanjia = deps.isKanjiaOwner.value

      if (isKanjia) {
        // 砍价购买：先清空现有购物车

        await cartStore.clear()
      }

      await cartStore.add(sku.cartPayload(buyNumber.value)!)

      closePopup()

      toast(t('goodsDetail.addCartSuccess'), 'success')

      if (isKanjia) {
        await availability.ensureAvailable()
        go(ClientRoutes.Ordering.pay, { kjId: deps.kanjiaId() })
      }
    }
    catch (e) {
      if (needsLogin(e)) {
        if (requireIdentity('customer')) {
          await deps.reload()
        }
      }
      else {
        showError(e)
      }
    }
    finally {
      submitting.value = false
    }
  }

  return {
    sel,
    additions,
    schedule,
    showPopup,
    selectSizePrice,
    selectSizeOPrice,
    totalScoreToPay,
    buyNumber,
    buyNumMin,
    buyNumMax,
    skuGoodsPic,
    hasMoreSelect,
    canSubmit,
    applyDetail,
    loadAdditions,
    loadSchedule,
    calculate,
    openPopup,
    closePopup,
    stepChange,
    selectProperty,
    toggleAddition,
    selectTime,
    isPropActive: sku.isPropActive,
    isAdditionActive: sku.isAdditionActive,
    isTimeActive: sku.isTimeActive,
    addShopCar,
  }
}
