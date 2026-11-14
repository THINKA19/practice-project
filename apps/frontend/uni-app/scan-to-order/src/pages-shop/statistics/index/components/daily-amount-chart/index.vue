<script setup lang="ts">
import type { TrendPoint } from '../../models'
import { computed, ref, watch } from 'vue'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { t } from '@/locale'

const props = defineProps<{
  points: TrendPoint[]
  title: string
  today: string
  currency?: string
}>()

const selectedDay = ref('')
const selected = computed(() => props.points.find(point => point.day === selectedDay.value))
const completed = computed(() => props.points.filter(point => point.day < props.today))
const max = computed(() => Math.max(0, ...props.points.map(point => point.value)))
const highest = computed(() => completed.value.reduce((best, point) => point.value > best.value ? point : best, completed.value[0]))
const lowest = computed(() => completed.value.reduce((best, point) => point.value < best.value ? point : best, completed.value[0]))
const labelStep = computed(() => props.points.length <= 7 ? 1 : Math.ceil((props.points.length - 1) / 5))

watch(() => props.points, () => {
  selectedDay.value = ''
})

function shortDay(day: string) {
  return day.slice(5).replace('-', '/')
}
</script>

<template>
  <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-24rpx">
    <view class="flex items-center justify-between gap-12rpx">
      <text class="text-30rpx text-[#17392a] font-semibold">{{ title }}</text>
      <text v-if="currency" class="text-22rpx text-[#52685d]">{{ currency }}</text>
    </view>
    <view v-if="selected" class="mt-16rpx flex flex-wrap items-center gap-x-16rpx text-24rpx">
      <text>{{ shortDay(selected.day) }}</text>
      <FgPrice class="font-semibold" :amount="selected.value" :currency-code="currency" amount-unit="settlement" />
      <text v-if="selected.day === today" class="text-[#52685d]">{{ t('shop.statistics.todaySoFar') }}</text>
    </view>
    <view v-if="points.length" class="mt-24rpx flex gap-12rpx">
      <view class="h-280rpx flex shrink-0 flex-col justify-between text-20rpx text-[#52685d]">
        <text v-if="max">{{ max }}</text>
        <text v-else />
        <text>0</text>
      </view>
      <view class="min-w-0 flex flex-1">
        <view
          v-for="(point, index) in points"
          :key="point.day"
          class="relative min-w-0 flex-1"
          role="button"
          :aria-label="`${point.day} ${point.value} ${currency ?? ''}`"
          @click="selectedDay = point.day"
        >
          <view class="relative h-280rpx border-b border-[#cbdad2]">
            <view
              class="absolute bottom-0 left-50% max-w-64rpx w-70% rounded-t-4rpx -translate-x-50%"
              :class="point.day === selectedDay ? 'bg-[#14633f]' : point.value > 0 ? 'bg-[#67a98b]' : 'bg-[#a7b9af]'"
              :style="{ height: max && point.value > 0 ? `${point.value / max * 100}%` : '4rpx' }"
            />
          </view>
          <view class="h-34rpx pt-6rpx text-center text-18rpx text-[#52685d]">
            <text v-if="index % labelStep === 0 && (labelStep === 1 || index < points.length - 2)" class="whitespace-nowrap">
              {{ shortDay(point.day) }}
            </text>
            <text v-else-if="index === points.length - 1" class="absolute right-0 whitespace-nowrap">
              {{ shortDay(point.day) }}
            </text>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="mt-16rpx text-24rpx text-[#52685d]">
      {{ t('shop.statistics.noTrend') }}
    </view>
    <view v-if="highest && lowest" class="mt-16rpx flex flex-wrap gap-x-20rpx gap-y-8rpx text-22rpx text-[#52685d]">
      <view>
        {{ t('shop.statistics.highest', { day: shortDay(highest.day) }) }}
        <FgPrice :amount="highest.value" :currency-code="currency" amount-unit="settlement" />
      </view>
      <view>
        {{ t('shop.statistics.lowest', { day: shortDay(lowest.day) }) }}
        <FgPrice :amount="lowest.value" :currency-code="currency" amount-unit="settlement" />
      </view>
    </view>
  </view>
</template>
