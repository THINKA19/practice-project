<script setup lang="ts">
import type { ContactItem } from '../models/contact'
import { t } from '@/locale'

defineProps<{ contact: ContactItem | null, hint?: string }>()
const emit = defineEmits<{ copy: [value: string] }>()
const visible = defineModel<boolean>({ default: false })
</script>

<template>
  <wd-popup v-model="visible" position="center" :z-index="1000" root-portal custom-class="rounded-24rpx">
    <view v-if="contact" class="box-border w-540rpx p-36rpx">
      <view class="mb-32rpx flex items-center justify-between">
        <text class="text-32rpx font-semibold">{{ contact.label }}</text>
        <wd-icon name="close" size="22px" :aria-label="t('contactDock.close')" @click="visible = false" />
      </view>
      <view class="mb-28rpx flex flex-col items-center gap-20rpx rounded-20rpx bg-[#effaf4] p-36rpx text-[#169b50]">
        <wd-icon :name="contact.icon" size="48px" />
        <text class="break-all text-32rpx">{{ contact.action.value }}</text>
      </view>
      <view v-if="hint" class="mb-24rpx text-center text-24rpx text-[#94a3b8]">
        {{ hint }}
      </view>
      <wd-button block @click="emit('copy', contact.action.value)">
        {{ t('contactDock.copy') }}
      </wd-button>
    </view>
  </wd-popup>
</template>
