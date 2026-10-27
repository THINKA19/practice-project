<script setup lang="ts">
/**
 * 单选列表（售后类型 / 货物状态 / 售后原因），整行可点
 */
import type { RadioOption } from './types'

defineOptions({ name: 'OptionRadioList' })

defineProps<{
  options: RadioOption[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <view class="option-list">
    <view v-for="opt in options" :key="opt.value" class="option-item" @tap="emit('update:modelValue', opt.value)">
      <text class="option-text">
        {{ opt.label }}
      </text>
      <wd-icon
        :name="modelValue === opt.value ? 'check-circle-fill' : 'uncheck-circle'"
        :color="modelValue === opt.value ? '#CF8E63' : '#ccc'"
        size="20px"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.option-list {
  padding: 0 32rpx 24rpx;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 2rpx solid #f8f1eb;

  &:last-child {
    border-bottom: none;
  }
}

.option-text {
  flex: 1;
  margin-right: 24rpx;
  font-size: 28rpx;
  color: #5a4a3a;
}
</style>
