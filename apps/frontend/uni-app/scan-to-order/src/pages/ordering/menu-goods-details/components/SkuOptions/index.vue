<script setup lang="ts">
import { useOrderingCurrency } from '@/pages/ordering/index'
import { computed } from 'vue'
import GoodsSkuSelector from '@/components/goods-sku-selector/index.vue'
/**
 * ============================================================================
 * 【文件概述】商品详情 / components/SkuOptions/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import SkuOptions from '@/pages/ordering/menu-goods-details/components/SkuOptions/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
/**
 * 规格 / 配件 / 时段 选项组（纯展示：props + emit）
 * 弹窗模式与页面展开模式共用
 */
import type { AdditionGroup, AdditionItem, GoodsProperty, PropertyChild, TimeScheduleDay } from '@/pages/ordering/menu'

const props = withDefaults(defineProps<{
  properties?: GoodsProperty[] | null
  additions?: AdditionGroup[] | null
  schedule?: TimeScheduleDay[] | null
  isPropActive: (propertyId: number, childId: number) => boolean
  isAdditionActive?: (item: AdditionItem) => boolean
  isTimeActive?: (dayIndex: number, slotIndex: number) => boolean
}>(), {
  properties: null,
  additions: null,
  schedule: null,
  isAdditionActive: () => false,
  isTimeActive: () => false,
})

const emit = defineEmits<{
  selectProperty: [propertyId: number, child: PropertyChild]
  toggleAddition: [group: AdditionGroup, item: AdditionItem]
  selectTime: [dayIndex: number, slotIndex: number]
}>()

const { countryCode } = useOrderingCurrency()
const propertyGroups = computed(() => (props.properties || []).map(g => ({
  id: g.id,
  name: g.name,
  choices: g.childsCurGoods.map(c => ({ id: c.id, name: c.name, price: c.price, active: props.isPropActive(g.id, c.id) })),
})))
const additionGroups = computed(() => (props.additions || []).map(g => ({
  id: g.id,
  name: g.name,
  choices: g.items.map(c => ({ id: c.id, name: c.name, price: c.price, isSurcharge: true, active: props.isAdditionActive(c) })),
})))
const timeGroups = computed(() => (props.schedule || []).map((d, di) => ({
  id: di,
  name: d.day,
  choices: d.items.map((s, si) => ({ id: si, name: s.name, active: props.isTimeActive(di, si) })),
})))
function selectProperty(g: number, c: number) {
  const choice = props.properties?.find(group => group.id === g)?.childsCurGoods.find(choice => choice.id === c)
  if (choice)
    emit('selectProperty', g, choice)
}
function selectAddition(g: number, c: number) {
  const group = props.additions?.find(group => group.id === g)
  const choice = group?.items.find(choice => choice.id === c)
  if (group && choice)
    emit('toggleAddition', group, choice)
}
</script>

<template>
  <view>
    <goods-sku-selector :groups="propertyGroups" :country-code="countryCode" @select="selectProperty" />
    <goods-sku-selector :groups="additionGroups" :country-code="countryCode" @select="selectAddition" />
    <goods-sku-selector :groups="timeGroups" :country-code="countryCode" @select="(g, c) => emit('selectTime', g, c)" />
  </view>
</template>
