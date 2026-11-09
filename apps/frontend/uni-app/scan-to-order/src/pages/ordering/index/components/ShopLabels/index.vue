<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】开业标签、主要活动摘要和底部详情入口，门店状态与活动状态分别表达。
 * 【方法与导出清单】默认组件：shop、showEnter；enter 回传确认后的门店快照。
 * 【综合使用示例】import { ShopLabels } from '@/pages/ordering/index'; // 绑定 shop 和 enter
 * ============================================================================
 */
import { computed, onScopeDispose, ref } from 'vue'
import { onHide, onShow } from '@dcloudio/uni-app'
import type { Shop } from '../../models/types'
import { promotionDateRange, visiblePromotions } from '../../domain/promotion.rules'
import { shopBusinessLabel, shopBusinessState } from '../../domain/shop.rules'
import ShopActivityPanel from '../ShopActivityPanel/index.vue'

const props = defineProps<{ shop: Shop, showEnter?: boolean }>()
const emit = defineEmits<{ enter: [shop: Shop] }>()
const open = ref(false)
const now = ref(Date.now())
const activities = computed(() => visiblePromotions(props.shop, now.value).slice(0, 1))
const state = computed(() => shopBusinessState(props.shop, now.value))
const stateLabel = computed(() => props.showEnter && state.value === 'open' ? '' : shopBusinessLabel(props.shop, now.value))
const selectedId = ref('')
let timer: ReturnType<typeof setInterval> | undefined
/** 刷新可见标签时钟。无参数。@returns void。@example startClock() // => 启动并替换本组件计时器 */
function startClock() {
  clearInterval(timer)
  now.value = Date.now()
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
}
startClock()
onShow(startClock)
onHide(() => {
  open.value = false
  clearInterval(timer)
})
onScopeDispose(() => clearInterval(timer))
</script>

<template>
  <view v-if="(!showEnter && state && state !== 'open') || (state === 'upcoming' && shop.openingDate) || activities.length || open" class="mb-20rpx">
    <text v-if="!showEnter && state && state !== 'open'" class="block text-24rpx text-[#777]">{{ stateLabel }}，暂不可下单</text>
    <text v-if="state === 'upcoming' && shop.openingDate" class="mt-12rpx block text-24rpx text-[#777]">预计 {{ shop.openingDate }} 开业</text>
    <view v-for="activity in activities" :key="activity.id" role="button" :aria-label="`查看${activity.title}活动详情`" class="mt-16rpx rounded-16rpx bg-[#fff9f0] p-20rpx" @tap.stop="selectedId = activity.id; open = true">
      <view class="flex items-start justify-between gap-16rpx">
        <text class="line-clamp-2 min-w-0 flex-1 break-words text-28rpx text-[#8b4513] font-600">{{ activity.title }}</text>
        <text aria-hidden="true" class="shrink-0 text-28rpx text-[#8b4513]">›</text>
      </view>
      <text class="mt-10rpx block text-24rpx text-[#777]">{{ promotionDateRange(activity) }}</text>
    </view>
    <ShopActivityPanel v-if="open" :model-value="open" :shop-id="shop.id" :activity-id="selectedId" :shop-name="shop.name" :show-enter="showEnter" @update:model-value="open = $event" @enter="emit('enter', $event)" />
  </view>
</template>
