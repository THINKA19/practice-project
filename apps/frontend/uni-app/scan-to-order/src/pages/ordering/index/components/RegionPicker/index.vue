<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / components/RegionPicker/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import RegionPicker from '@/pages/ordering/index/components/RegionPicker/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import { computed, ref, watch } from 'vue'
import { normalizeRegionSelection } from '../../models/region-mappers'
import type { ShopRegion, ShopRegionSelection } from '../../models/regions'

const props = defineProps<{ modelValue: boolean, selection: ShopRegionSelection, regions: ShopRegion[], loading?: boolean, error?: string, ready: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean], 'apply': [selection: ShopRegionSelection], 'retry': [] }>()
const country = ref('')
const city = ref('')
const district = ref('')
const cities = computed(() => props.regions.find(item => item.code === country.value)?.cities ?? [])
const districts = computed(() => cities.value.find(item => item.code === city.value)?.districts ?? [])
const cityName = computed(() => cities.value.find(item => item.code === city.value)?.name)
const summary = computed(() => [props.regions.find(item => item.code === country.value)?.name, cities.value.find(item => item.code === city.value)?.name, districts.value.find(item => item.code === district.value)?.name].filter(Boolean).join(' / ') || '全部已开放门店 · 默认排序')
watch(() => props.modelValue, (open) => {
  if (open) {
    country.value = props.selection.countryCode
    city.value = props.selection.cityCode
    district.value = props.selection.districtCode
  }
}, { immediate: true })
watch(() => props.regions, () => {
  const valid = normalizeRegionSelection(props.regions, { countryCode: country.value, cityCode: city.value, districtCode: district.value })
  country.value = valid.countryCode
  city.value = valid.cityCode
  district.value = valid.districtCode
})
function chooseCountry(code: string) {
  if (country.value === code)
    return
  country.value = code
  city.value = ''
  district.value = ''
}
function chooseCity(code: string) {
  if (city.value === code)
    return
  city.value = code
  district.value = ''
}
function confirm() {
  if (!props.ready || props.loading || props.error || !props.regions.length)
    return
  emit('apply', normalizeRegionSelection(props.regions, { countryCode: country.value, cityCode: city.value, districtCode: district.value }))
  emit('update:modelValue', false)
}
</script>

<template>
  <wd-popup :model-value="modelValue" position="bottom" root-portal custom-style="background: #fff;" :z-index="1200" round safe-area-inset-bottom @update:model-value="emit('update:modelValue', $event)">
    <view class="region-panel">
      <view class="flex items-center justify-between px-32rpx py-28rpx">
        <text class="text-32rpx text-[#2c1810] font-600">选择地区</text>
        <view class="text-26rpx text-[#333333]" @tap="emit('update:modelValue', false)">
          取消
        </view>
      </view>
      <view class="px-32rpx pb-24rpx text-24rpx text-[#888888]">
        {{ summary }}
      </view>
      <view v-if="loading" class="px-32rpx py-48rpx text-center">
        <PageLoading title="正在加载开放地区…" />
      </view>
      <view v-else-if="error" class="px-32rpx py-48rpx text-center">
        <text>{{ error }}</text>
        <button class="mt-24rpx" @tap="emit('retry')">
          重新加载
        </button>
      </view>
      <view v-else-if="ready && !regions.length" class="px-32rpx py-48rpx text-center">
        暂无开放地区
      </view>
      <view v-else-if="ready" class="region-columns">
        <view class="region-column">
          <view class="column-title">
            国家
          </view>
          <scroll-view scroll-y :show-scrollbar="false" class="options-scroll">
            <view class="region-option" :class="{ active: !country }" @tap="chooseCountry('')">
              不限
            </view>
            <view v-for="item in regions" :key="item.code" class="region-option" :class="{ active: country === item.code }" @tap="chooseCountry(item.code)">
              {{ item.name }}
            </view>
          </scroll-view>
        </view>
        <view class="region-column">
          <view class="column-title">
            城市
          </view>
          <scroll-view :key="`cities-${country}`" scroll-y :show-scrollbar="false" class="options-scroll city-options">
            <view v-if="!country" class="region-hint active">
              不限城市
            </view>
            <template v-else>
              <view class="region-option" :class="{ active: !city }" @tap="chooseCity('')">
                不限
              </view>
              <view v-for="item in cities" :key="item.code" class="region-option" :class="{ active: city === item.code }" @tap="chooseCity(item.code)">
                {{ item.name }}
              </view>
            </template>
          </scroll-view>
        </view>
        <view class="region-column">
          <view class="column-title">
            {{ cityName ? `${cityName} · 区县` : '区县' }}
          </view>
          <scroll-view :key="`districts-${country}-${city}`" scroll-y :show-scrollbar="false" class="options-scroll district-options">
            <view v-if="!city" class="region-hint">
              不限区域
            </view>
            <template v-else>
              <view class="region-option" :class="{ active: !district }" @tap="district = ''">
                不限
              </view>
              <view v-for="item in districts" :key="item.code" class="region-option" :class="{ active: district === item.code }" @tap="district = item.code">
                {{ item.name }}
              </view>
            </template>
          </scroll-view>
        </view>
      </view>
      <view class="flex gap-24rpx px-32rpx py-28rpx">
        <button class="region-confirm" :disabled="!ready || loading || !!error || !regions.length" @tap="confirm">
          {{ country ? '确认地区' : '查看全部门店' }}
        </button>
      </view>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
.region-panel {
  --region-accent: #067a45;
  background: #fff;
}
.region-columns {
  display: flex;
  border-top: 1rpx solid #eeeeee;
  border-bottom: 1rpx solid #eeeeee;
}
.region-column {
  flex: 1;
  min-width: 0;
}
.region-column + .region-column {
  border-left: 1rpx solid #eeeeee;
}
.column-title {
  padding: 20rpx 12rpx;
  font-size: 26rpx;
  text-align: center;
  color: #333333;
  font-weight: 600;
}
.options-scroll {
  height: 440rpx;
}
/* #ifdef H5 */
.options-scroll :deep(.uni-scroll-view) {
  scrollbar-width: none;
}
.options-scroll :deep(.uni-scroll-view::-webkit-scrollbar) {
  display: none;
  width: 0;
  height: 0;
}
/* #endif */
.region-option {
  padding: 26rpx 12rpx;
  font-size: 26rpx;
  text-align: center;
  color: #666666;
}
.region-option.active::after {
  content: '✓';
  margin-left: 8rpx;
  font-size: 24rpx;
}
.region-option.active {
  color: var(--region-accent);
  background: #fff;
  font-weight: 600;
}
.region-hint {
  padding: 26rpx 16rpx;
  font-size: 24rpx;
  text-align: center;
  color: #999999;
}
.region-confirm {
  height: 80rpx;
  margin: 0;
  font-size: 28rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  flex: 1;
  background: var(--region-accent);
  color: #fff;
}
.region-confirm[disabled] {
  background: #f2f2f2;
  color: #666666;
}
.region-confirm::after {
  border: 0;
}
</style>
