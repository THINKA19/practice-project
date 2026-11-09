/**
 * ============================================================================
 * 【文件概述】菜单选品 / composables/use-sku-selection.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - SkuSelectionOptions：数据类型契约。
 * - TimeChoiceResult：数据类型契约。
 * - SkuCartPayload：数据类型契约。
 * - useOrderingSkuSelection：本文件对外声明。
 * - SkuSelectionEngine：数据类型契约。
 * 【综合使用示例】
 * import type { SkuSelectionOptions } from '@/pages/ordering/menu/composables/use-sku-selection'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
import type { Ref } from 'vue'
import type { AdditionGroup, AdditionItem, GoodsDetail, SkuPayloadItem, SkuPriceResult, SkuSelection, TimeScheduleDay } from '../models/goods.types'
import { computed, getCurrentScope, onScopeDispose, ref, watch } from 'vue'
import { catalogApi } from '../api/catalog.api'
import { buildAdditionPayload, buildSkuPayload, emptySelection, isAdditionComplete, isAdditionSelected, isPropertySelected, isSkuComplete, propertyChildIds, quotePrice, selectedTimeSlot, selectProperty, selectTimeSlot, toggleAddition } from '../domain/catalog.rules'
/**
 * SKU 选择引擎：规格 / 加料 / 时段选择、SKU 询价（防乱序）、计价与加购参数。
 * 点餐页弹层、商品详情、商品列表快选三处共用，规则全部委托 models/catalog 纯函数。
 * 只产出选择结果与加购参数，不依赖购物车；何时询价、提示文案和加购交互由各消费方决定。
 * 结构字段：detail、pingtuan；必填与可选字段见声明。
 * @example
 * import type { SkuSelectionOptions } from '@/pages/ordering/menu/composables/use-sku-selection'
 * declare const response: SkuSelectionOptions
 * const value: SkuSelectionOptions = response // => 保留 SkuSelectionOptions 的字段与取值约束
 */

export interface SkuSelectionOptions {
  detail: Ref<GoodsDetail | null>
  /** 拼团模式按拼团价计价 */
  pingtuan?: Ref<boolean>
}

/**
 * TimeChoiceResult 数据契约；字段可选性及取值范围以声明为准。
 * 值约束：'ok' | 'noStores' | 'invalid'。
 * @example
 * import type { TimeChoiceResult } from '@/pages/ordering/menu/composables/use-sku-selection'
 * declare const response: TimeChoiceResult
 * const value: TimeChoiceResult = response // => 保留 TimeChoiceResult 的字段与取值约束
 */
export type TimeChoiceResult = 'ok' | 'noStores' | 'invalid'

/**
 * 与购物车加购命令结构一致（结构类型，不依赖 cart 领域）
 * 结构字段：goodsId、number、sku、addition、goodsTimesDay、goodsTimesItem；必填与可选字段见声明。
 * @example
 * import type { SkuCartPayload } from '@/pages/ordering/menu/composables/use-sku-selection'
 * declare const response: SkuCartPayload
 * const value: SkuCartPayload = response // => 保留 SkuCartPayload 的字段与取值约束
 */
export interface SkuCartPayload {
  goodsId: number
  number: number
  sku: SkuPayloadItem[]
  addition: ReturnType<typeof buildAdditionPayload>
  goodsTimesDay?: string
  goodsTimesItem?: string
}

/**
 * 创建规格、加料与时段选择引擎，报价结果只应用于仍有效的选择实例。
 * @param options {SkuSelectionOptions} 调用配置及依赖能力。
 * @returns 对象，包含 selection、additions、schedule、skuPrice、quote、reset、setSchedule、requote、chooseProperty、chooseAddition、chooseAdditionById、chooseTime、isPropActive、isAdditionActive、isTimeActive、isPropertiesComplete、isAdditionsComplete、cartPayload。
 * @example
 * import { useOrderingSkuSelection } from '@/pages/ordering/menu/composables/use-sku-selection'
 * declare const options: Parameters<typeof useOrderingSkuSelection>[0]
 * useOrderingSkuSelection(options) // => 对象，包含 selection、additions、schedule、skuPrice、quote、reset、setSchedule、requote、chooseProperty、chooseAddition、chooseAdditionById、chooseTime、isPropActive、isAdditionActive、isTimeActive、isPropertiesComplete、isAdditionsComplete、cartPayload
 */
export function useOrderingSkuSelection(options: SkuSelectionOptions) {
  const { detail } = options

  const selection = ref<SkuSelection>(emptySelection())

  const additions = ref<AdditionGroup[] | null>(null)

  const schedule = ref<TimeScheduleDay[] | null>(null)

  const skuPrice = ref<SkuPriceResult | null>(null)

  let priceSeq = 0
  watch(detail, () => {
    priceSeq++
    skuPrice.value = null
  }, { flush: 'sync' })
  if (getCurrentScope())
    onScopeDispose(() => { priceSeq++ })

  const quote = computed(() => detail.value
    ? quotePrice({ detail: detail.value, sel: selection.value, skuPrice: skuPrice.value, schedule: schedule.value, additions: additions.value, pingtuan: options.pingtuan?.value })
    : null)

  /** 重置为未选择，由用户主动选择规格、加料和时段 */

  function reset() {
    priceSeq++

    selection.value = emptySelection()

    skuPrice.value = null
  }

  function setSchedule(list: TimeScheduleDay[] | null) {
    schedule.value = list && list.length ? list : null

    selection.value = { ...selection.value, time: null }
  }

  /**
   * SKU 询价：enabled 为 false 时清空 SKU 价；失败视为无 SKU 价。
   * 返回本次结果是否仍是最新一次（过期结果已丢弃）。
   */

  async function requote(enabled: boolean): Promise<boolean> {
    const seq = ++priceSeq

    const d = detail.value

    if (!enabled || !d) {
      skuPrice.value = null

      return true
    }

    const result = await catalogApi.goodsPrice(d.basicInfo.id, propertyChildIds(d, selection.value)).catch(() => null)

    if (seq !== priceSeq)
      return false

    skuPrice.value = result

    return true
  }

  function chooseProperty(propertyId: number, childId: number) {
    selection.value = selectProperty(selection.value, propertyId, childId)
  }

  function chooseAddition(group: AdditionGroup, item: AdditionItem) {
    selection.value = toggleAddition(selection.value, group, item)
  }

  /** 按 id 查找后切换加料 */

  function chooseAdditionById(groupId: number, itemId: number) {
    const group = additions.value?.find(g => g.id === groupId)

    const item = group?.items.find(i => i.id === itemId)

    if (group && item)
      chooseAddition(group, item)
  }

  function chooseTime(dayIndex: number, slotIndex: number): TimeChoiceResult {
    const list = schedule.value

    const slot = list?.[dayIndex]?.items[slotIndex]

    if (!list || !slot)
      return 'invalid'

    if (slot.stores <= 0)
      return 'noStores'

    selection.value = selectTimeSlot(selection.value, list, dayIndex, slotIndex)

    return 'ok'
  }

  const isPropActive = (propertyId: number, childId: number) => isPropertySelected(selection.value, propertyId, childId)

  const isAdditionActive = (item: AdditionItem) => isAdditionSelected(selection.value, item)

  const isTimeActive = (dayIndex: number, slotIndex: number) =>
    !!selection.value.time && selection.value.time[0] === dayIndex && selection.value.time[1] === slotIndex

  /** 规格是否选全；withSchedule 时同时要求已选时段 */

  function isPropertiesComplete(withSchedule: boolean) {
    return !!detail.value && isSkuComplete(detail.value, selection.value, withSchedule ? schedule.value : null)
  }

  /** 必选加料是否选全；groups 缺省为全部加料组 */

  function isAdditionsComplete(groups: AdditionGroup[] | null = additions.value) {
    return isAdditionComplete(groups, selection.value)
  }

  function cartPayload(number: number): SkuCartPayload | null {
    const d = detail.value

    if (!d)
      return null

    const time = selectedTimeSlot(schedule.value, selection.value)

    return {
      goodsId: d.basicInfo.id,
      number,
      sku: buildSkuPayload(d, selection.value),
      addition: buildAdditionPayload(additions.value, selection.value),
      goodsTimesDay: time?.day,
      goodsTimesItem: time?.slot.name,
    }
  }

  return {
    selection,
    additions,
    schedule,
    skuPrice,
    quote,
    reset,
    setSchedule,
    requote,
    chooseProperty,
    chooseAddition,
    chooseAdditionById,
    chooseTime,
    isPropActive,
    isAdditionActive,
    isTimeActive,
    isPropertiesComplete,
    isAdditionsComplete,
    cartPayload,
  }
}

/**
 * SkuSelectionEngine 数据契约；字段可选性及取值范围以声明为准。
 * 值约束：ReturnType<typeof useOrderingSkuSelection>。
 * @example
 * import type { SkuSelectionEngine } from '@/pages/ordering/menu/composables/use-sku-selection'
 * declare const response: SkuSelectionEngine
 * const value: SkuSelectionEngine = response // => 保留 SkuSelectionEngine 的字段与取值约束
 */
export type SkuSelectionEngine = ReturnType<typeof useOrderingSkuSelection>
