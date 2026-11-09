<script setup lang="ts">
/** 店名旁的经营状态胶囊，不承载活动或点击入口。 */
import { computed, onScopeDispose, ref } from 'vue'
import { onHide, onShow } from '@dcloudio/uni-app'
import type { Shop } from '../../models/types'
import { shopBusinessLabel, shopBusinessState } from '../../domain/shop.rules'

const props = defineProps<{ shop: Shop, showOpen?: boolean }>()
const now = ref(Date.now())
const state = computed(() => shopBusinessState(props.shop, now.value))
const label = computed(() => !props.showOpen && state.value === 'open' ? '' : shopBusinessLabel(props.shop, now.value))
const statusColors = computed(() => ({
  open: 'bg-[#edf7ef] text-[#387549]',
  resting: 'bg-[#f2efeb] text-[#806f60]',
  suspended: 'bg-[#fff0f0] text-[#b94a48]',
  upcoming: 'bg-[#fff3e5] text-[#9a612c]',
})[state.value ?? 'resting'])
let timer: ReturnType<typeof setInterval> | undefined
function startClock() {
  clearInterval(timer)
  now.value = Date.now()
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
}
startClock()
onShow(startClock)
onHide(() => clearInterval(timer))
onScopeDispose(() => clearInterval(timer))
</script>

<template>
  <text v-if="label" class="business-badge inline-block shrink-0 rounded-full px-16rpx py-6rpx text-22rpx font-medium leading-32rpx" :class="statusColors">{{ label }}</text>
</template>
