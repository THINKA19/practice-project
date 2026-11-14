<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import PhoneContact from '@/components/phone-contact/index.vue'
import { t } from '@/locale'
import { shopText as st } from '@/locale/shop-text'
import { useMerchantPage } from '@/pages-shop/auth/permissions'
import { useMerchantNoticeLifecycle } from '@/pages-shop/shop/index'
import { useMerchantDelivery } from './composables/useMerchantDelivery'

definePage({ style: { navigationBarTitleText: '骑手管理' } })
const access = useMerchantPage()
const { granted } = access
useMerchantNoticeLifecycle(access)
const { cards, error, loading, refresh, copied, contactPhone, contactRevision, copyPhone, hideAvatar } = useMerchantDelivery(access)
</script>

<template>
  <view class="box-border min-h-screen bg-[#f5f7f6] p-32rpx">
    <PageLoading v-if="!granted || loading" />
    <view v-else-if="error" class="rounded-24rpx bg-white p-32rpx text-center">
      <text class="mb-20rpx block">{{ st(error) }}</text>
      <wd-button size="small" plain @click="refresh">
        {{ st('重试') }}
      </wd-button>
    </view>
    <text v-else-if="!cards.length" class="block rounded-24rpx bg-white p-40rpx text-center text-[#5c6b63]">暂无配送联系人</text>
    <view v-else class="grid grid-cols-1 mx-auto max-w-800px gap-24rpx sm:grid-cols-2">
      <view v-for="contact in cards" :key="contact.id" class="border border-[#e2ebe5] rounded-28rpx bg-white p-28rpx">
        <view class="flex items-center gap-20rpx">
          <image
            v-if="contact.avatarUrl"
            :src="contact.avatarUrl"
            mode="aspectFill"
            class="h-88rpx w-88rpx shrink-0 rounded-full bg-[#e7f2eb]"
            @error="hideAvatar(contact.id)"
          />
          <view v-else class="h-88rpx w-88rpx flex shrink-0 items-center justify-center rounded-full bg-[#e7f2eb] text-34rpx text-[#246644] font-semibold">
            {{ contact.initial }}
          </view>
          <view class="min-w-0">
            <text class="block break-words text-32rpx text-[#17392a] font-semibold">{{ st(contact.name) }}</text>
            <text v-if="contact.role" class="mt-6rpx block break-words text-24rpx text-[#5c6b63]">{{ st(contact.role) }}</text>
          </view>
        </view>
        <view class="my-24rpx rounded-16rpx bg-[#f5f7f6] px-20rpx py-16rpx">
          <text class="block text-22rpx text-[#5c6b63]">{{ st('电话') }}</text>
          <text class="mt-4rpx block break-all text-32rpx text-[#17392a] font-semibold" selectable>{{ contact.phone }}</text>
        </view>
        <view class="grid grid-cols-2 gap-16rpx">
          <wd-button plain block @click="copyPhone(contact.id)">
            {{ t('rider.profile.copyPhone') }}
          </wd-button>
          <PhoneContact :key="contactRevision" :phone="contact.phone" :resolve-phone="() => contactPhone(contact.id)" copy-on-dial-failure>
            <template #trigger="{ open }">
              <wd-button block @click="open">
                {{ t('rider.profile.callPhone') }}
              </wd-button>
            </template>
          </PhoneContact>
        </view>
      </view>
    </view>
    <wd-popup v-if="copied" :model-value="copied" position="center" root-portal :modal="false" :duration="150" :z-index="1400" custom-style="padding: 10px 16px; border-radius: 8px; background: #e1f5e8; color: #16713d; box-shadow: 0 4px 16px #00000014; pointer-events: none;">
      <view class="flex items-center gap-8px text-14px leading-20px" role="status" aria-live="polite">
        <text class="text-16px font-600">✓</text>
        <text>电话号码已复制</text>
      </view>
    </wd-popup>
  </view>
</template>
