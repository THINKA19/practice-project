<script setup lang="ts">
import type { WechatTicket } from '../models/wechat'
import { t } from '@/locale'

defineProps<{ ticket: WechatTicket, expired: boolean, loading: boolean }>()
defineEmits<{ confirm: [], refresh: [] }>()
</script>

<template>
  <view class="mt-32rpx flex flex-col items-center gap-24rpx rounded-24rpx bg-[#f7faf6] p-32rpx">
    <text class="text-28rpx text-[#8b4513]">{{ t('auth.wxDemoQr') }}</text>
    <wd-qr-code v-if="!expired && ticket.qrContent" :text="ticket.qrContent" :size="180" />
    <text class="text-center text-26rpx text-[#8b6f47]">{{ t(expired ? 'auth.wxExpired' : 'auth.wxDemoQrHint') }}</text>
    <wd-button :disabled="loading" :loading="loading" @click="expired ? $emit('refresh') : $emit('confirm')">
      {{ t(expired ? 'auth.wxRefresh' : 'auth.wxDemoConfirm') }}
    </wd-button>
  </view>
</template>
