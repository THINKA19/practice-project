<script setup lang="ts">
defineProps<{ modelValue: boolean, phone: string, message: string, copying: boolean, successVisible?: boolean, title: string, description: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean], 'copy': [] }>()
</script>

<template>
  <wd-popup v-if="successVisible" :model-value="successVisible" position="center" root-portal :modal="false" :duration="150" :z-index="1400" custom-style="padding: 10px 16px; border-radius: 8px; background: #e1f5e8; color: #16713d; box-shadow: 0 4px 16px #00000014; pointer-events: none;">
    <view class="flex items-center gap-8px text-14px leading-20px" role="status" aria-live="polite">
      <text class="text-16px font-600">✓</text>
      <text>电话号码已复制</text>
    </view>
  </wd-popup>
  <wd-popup :model-value="modelValue" position="center" root-portal round :z-index="1300" custom-style="width: 90vw; max-width: 360px; background: #fff;" @update:model-value="emit('update:modelValue', $event)">
    <view class="p-32rpx" @tap.stop>
      <view class="text-center text-32rpx text-[#2c1810] font-600">
        {{ title }}
      </view>
      <text class="phone-number my-28rpx block text-center text-36rpx text-[#8b4513] font-600" selectable user-select>
        {{ phone }}
      </text>
      <view class="text-26rpx text-[#666666] leading-40rpx">
        {{ description }}
      </view>
      <view v-if="message" class="mt-16rpx text-26rpx text-[#8b4513] leading-40rpx" role="status">
        {{ message }}
      </view>
      <view class="mt-28rpx flex gap-16rpx">
        <button class="m-0 flex-1 rounded-16rpx bg-[#8b4513] px-16rpx text-28rpx text-white" :disabled="copying" @tap="emit('copy')">
          {{ copying ? '复制中…' : '复制号码' }}
        </button>
      </view>
      <button class="m-0 mt-16rpx w-full rounded-16rpx bg-[#f5f5f5] text-28rpx text-[#666666]" @tap="emit('update:modelValue', false)">
        关闭
      </button>
    </view>
  </wd-popup>
</template>

<style scoped>
.phone-number {
  overflow-wrap: anywhere;
  user-select: text;
}
</style>
