/**
 * ============================================================================
 * 【文件概述】菜单选品 / composables/use-sku-popup.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - SkuPopupOptions：数据类型契约。
 * - useOrderingSkuPopup：本文件对外声明。
 * - SkuPopupVm：数据类型契约。
 * 【综合使用示例】
 * import type { SkuPopupOptions } from '@/pages/ordering/menu/composables/use-sku-popup'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
import { useOrderingCurrency } from '@/pages/ordering/index'
import { catalogApi } from '../api/catalog.api'
import { propertyChildIds, skuPicture } from '../domain/catalog.rules'
import { toGoodsDetail } from '../models/goods.mappers'
import { useOrderingSkuSelection } from './use-sku-selection'
import type { AddCartResult } from './use-cart-bar'
import type { OptionGroupView } from '../models/types'
import type { AdditionGroup, GoodsDetail, TimeScheduleDay } from '../models/goods.types'
import type { AddCartCommand, CartItem } from '@/pages/ordering/menu-cart'
import { computed, ref, watch } from 'vue'
import { useOrderingLocale as useI18n } from './use-locale'
import { showError, toast } from '@/utils/project/interaction'
/**
 * 点餐页 - 商品规格弹层 ViewModel（规格 / 加料 / 时段 / 计价 / 数量 / 加购）
 * 来源：bee-master/pages/index/index.js _showGoodsDetailPOP(详情部分)/goodsAddition/_goodsTimesSchedule/
 *       skuClick/skuClick2/skuClick3/calculateGoodsPrice/skuCanSubmit/additionCanSubmit/goodsStepChange/addCart2
 * 选择、询价、计价由 goods 领域的 useOrderingSkuSelection 引擎完成；这里只维护弹层状态、展示模型和加购交互。
 * 结构字段：addToCart、onClose；必填与可选字段见声明。
 * @example
 * import type { SkuPopupOptions } from '@/pages/ordering/menu/composables/use-sku-popup'
 * declare const response: SkuPopupOptions
 * const value: SkuPopupOptions = response // => 保留 SkuPopupOptions 的字段与取值约束
 */

export interface SkuPopupOptions {
  /** 加购（由购物车 ViewModel 提供） */
  addToCart: (cmd: AddCartCommand) => Promise<AddCartResult>
  /** 关闭商品弹层（规格弹层与拼团弹层一起关闭，并恢复 tabBar） */
  onClose: () => void
  updateCart?: (item: CartItem, cmd: AddCartCommand) => Promise<AddCartResult>
}

/**
 * 创建 use-sku-popup 对应的领域状态与交互能力。
 * @param options {SkuPopupOptions} 调用配置及依赖能力。
 * @returns 对象，包含 visible、detail、additions、schedule、selection、number、pingtuanMode、goodsId、minBuy、requiredAdditions、quote、picture、propertyGroups、additionGroups、timeGroups、load、open、hide、setPingtuanMode、chooseProperty、chooseAddition、chooseTime、setNumber、validate、addToCart。
 * @example
 * import { useOrderingSkuPopup } from '@/pages/ordering/menu/composables/use-sku-popup'
 * declare const options: Parameters<typeof useOrderingSkuPopup>[0]
 * useOrderingSkuPopup(options) // => 对象，包含 visible、detail、additions、schedule、selection、number、pingtuanMode、goodsId、minBuy、requiredAdditions、quote、picture、propertyGroups、additionGroups、timeGroups、load、open、hide、setPingtuanMode、chooseProperty、chooseAddition、chooseTime、setNumber、validate、addToCart
 */
export function useOrderingSkuPopup(options: SkuPopupOptions) {
  const { t } = useI18n()
  const { currencySymbol, currencyUnit } = useOrderingCurrency()

  const visible = ref(false)
  const submitting = ref(false)
  const editingItem = ref<CartItem | null>(null)

  const detail = ref<GoodsDetail | null>(null)

  const number = ref(1)
  /** 立即开团购买模式（原 lijipingtuanbuy）：按拼团价计价，按钮变为“一起拼” */

  const pingtuanMode = ref(false)

  const sku = useOrderingSkuSelection({ detail, pingtuan: pingtuanMode })

  const { selection, additions, schedule, quote } = sku

  let loadToken = 0

  const goodsId = computed(() => detail.value?.basicInfo.id ?? null)

  const minBuy = computed(() => detail.value?.basicInfo.minBuyNumber || 1)
  /** 参与必选校验的加料组（原 additionCanSubmit 仅在 hasAddition 时校验） */

  const requiredAdditions = computed(() => (detail.value?.basicInfo.hasAddition ? additions.value : null))

  const picture = computed(() => (detail.value ? skuPicture(detail.value, selection.value, detail.value.basicInfo.pic) : ''))

  const propertyGroups = computed<OptionGroupView[]>(() =>
    (detail.value?.properties || []).map(p => ({
      id: p.id,
      name: p.name,
      choices: p.childsCurGoods.map(c => ({ id: c.id, name: c.name, priceText: typeof c.price === 'number' ? `${currencySymbol.value}${c.price}${currencyUnit.value}` : undefined, active: sku.isPropActive(p.id, c.id) })),
    })),
  )

  const additionGroups = computed<OptionGroupView[]>(() =>
    (additions.value || []).map(g => ({
      id: g.id,
      name: g.name,
      choices: g.items.map(i => ({ id: i.id, name: i.name, priceText: `+${currencySymbol.value}${i.price}${currencyUnit.value}`, active: sku.isAdditionActive(i) })),
    })),
  )

  /** 时段：组 id 为天下标，选项 id 为时段下标 */

  const timeGroups = computed<OptionGroupView[]>(() =>
    (schedule.value || []).map((d, di) => ({
      id: di,
      name: d.day,
      choices: d.items.map((s, si) => ({ id: si, name: s.name, active: sku.isTimeActive(di, si) })),
    })),
  )

  /** 规格/时段选全后查询 SKU 价格（原 calculateGoodsPrice 中的 goodsPrice 调用） */

  watch(
    () => (detail.value ? `${detail.value.basicInfo.id}|${propertyChildIds(detail.value, selection.value)}|${selection.value.time}` : ''),
    () => sku.requote(!!detail.value?.properties?.length && sku.isPropertiesComplete(true)),
  )

  /** 加载商品详情、加料、时段并重置选择（不负责弹出） */

  async function load(id: number | string, original?: CartItem): Promise<GoodsDetail | null> {
    if (submitting.value)
      return null
    const token = ++loadToken

    let res: [GoodsDetail, AdditionGroup[] | null, TimeScheduleDay[] | null]

    try {
      res = await Promise.all([
        catalogApi.goodsDetail(id).then(toGoodsDetail),
        catalogApi.goodsAddition(id).catch(() => null),
        catalogApi.timesSchedule(id).catch(() => null),
      ])
    }
    catch (e) {
      showError(e)

      return null
    }

    if (token !== loadToken) {
      return null
    }

    const [d, add, times] = res

    detail.value = d

    additions.value = add && add.length ? add : null

    sku.setSchedule(times)

    sku.reset()
    editingItem.value = original ? JSON.parse(JSON.stringify(original)) as CartItem : null
    if (original) {
      const savedSku = original.sku?.length
        ? original.sku
        : (original.propertyChildIds ?? '').split(',').filter(Boolean).map((pair) => {
            const [optionId, optionValueId] = pair.split(':').map(Number)
            return { optionId, optionValueId }
          })
      for (const option of savedSku) {
        const group = d.properties?.find(group => group.id === option.optionId)
        if (group?.childsCurGoods.some(choice => choice.id === option.optionValueId))
          sku.chooseProperty(group.id, option.optionValueId!)
      }
      for (const option of original.additions ?? []) {
        const group = additions.value?.find(group => group.id === option.pid)
        const choice = group?.items.find(choice => choice.id === option.id)
        if (group && choice)
          sku.chooseAddition(group, choice)
      }
      const dayIndex = schedule.value?.findIndex(day => day.day === original.goodsTimesDay) ?? -1
      const slotIndex = schedule.value?.[dayIndex]?.items.findIndex(slot => slot.name === original.goodsTimesItem) ?? -1
      if (dayIndex >= 0 && slotIndex >= 0)
        sku.chooseTime(dayIndex, slotIndex)
    }

    number.value = original?.number ?? (d.basicInfo.minBuyNumber || 1)

    pingtuanMode.value = false

    return d
  }

  function open() {
    visible.value = true
  }

  function hide() {
    if (!submitting.value)
      visible.value = false
  }

  function setPingtuanMode(on: boolean) {
    pingtuanMode.value = on
  }

  function chooseTime(dayIndex: number, slotIndex: number) {
    if (sku.chooseTime(dayIndex, slotIndex) === 'noStores')
      toast(t('goodsDetail.noStores'))
  }

  function setNumber(n: number) {
    number.value = n
  }

  /** 规格、时段、必选加料是否选全；未选全时提示 */

  function validate(): boolean {
    if (!detail.value) {
      return false
    }

    if (!sku.isPropertiesComplete(true) || !sku.isAdditionsComplete(requiredAdditions.value)) {
      toast(t('goodsDetail.noSelectSku'))

      return false
    }

    return true
  }

  /** 加入购物车（原 addCart2） */

  async function addToCart() {
    if (submitting.value || !validate()) {
      return
    }

    const payload = sku.cartPayload(number.value)

    if (!payload)
      return

    const token = loadToken
    submitting.value = true
    try {
      const result = editingItem.value
        ? await options.updateCart?.(editingItem.value, payload)
        : await options.addToCart(payload)
      if (result === 'ok' && token === loadToken) {
        visible.value = false
        options.onClose()
      }
    }
    finally {
      submitting.value = false
    }
  }

  return {
    visible,
    submitting,
    editingItem,
    detail,
    additions,
    schedule,
    selection,
    number,
    pingtuanMode,
    goodsId,
    minBuy,
    requiredAdditions,
    quote,
    picture,
    propertyGroups,
    additionGroups,
    timeGroups,
    load,
    open,
    hide,
    setPingtuanMode,
    chooseProperty: sku.chooseProperty,
    chooseAddition: sku.chooseAdditionById,
    chooseTime,
    setNumber,
    validate,
    addToCart,
  }
}

/**
 * SkuPopupVm 数据契约；字段可选性及取值范围以声明为准。
 * 值约束：ReturnType<typeof useOrderingSkuPopup>。
 * @example
 * import type { SkuPopupVm } from '@/pages/ordering/menu/composables/use-sku-popup'
 * declare const response: SkuPopupVm
 * const value: SkuPopupVm = response // => 保留 SkuPopupVm 的字段与取值约束
 */
export type SkuPopupVm = ReturnType<typeof useOrderingSkuPopup>
