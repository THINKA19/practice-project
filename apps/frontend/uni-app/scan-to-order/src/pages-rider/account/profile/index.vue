<!--
============================================================================
【文件概述】骑手资料页面视图；状态和操作由本模块组合函数提供。
【方法与导出清单】页面默认组件；useRiderProfilePage 负责页面装配。
【综合使用示例】
import { useRiderProfilePage } from './composables/use-page'
const page = useRiderProfilePage() // 在 script setup 中绑定页面数据
============================================================================
-->
<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import { onShow } from '@dcloudio/uni-app'
import { t } from '@/locale'
import { useRiderProfilePage } from './composables/use-page'

definePage({ style: { navigationBarTitleText: '骑手资料', navigationBarBackgroundColor: '#A0826D', navigationBarTextStyle: 'white' } })
const { profile, name, phone, loading, saving, error, save, refresh } = useRiderProfilePage()

onShow(() => uni.setNavigationBarTitle({ title: t('rider.profile.navTitle') }))
</script>

<template>
  <view class="min-h-screen bg-[#FFF8F1] p-32rpx text-[#5A3A22]">
    <view class="rounded-24rpx bg-white p-32rpx">
      <view class="mb-32rpx text-32rpx font-semibold">
        {{ t('rider.profile.title') }}
      </view>
      <wd-input v-model="name" :label="t('rider.profile.name')" :placeholder="t('rider.profile.namePlaceholder')" :maxlength="30" :disabled="loading || saving" />
      <wd-input v-model="phone" :label="t('rider.profile.phone')" :placeholder="t('rider.profile.phonePlaceholder')" type="number" :maxlength="11" :disabled="loading || saving" />
      <view class="flex justify-between">
        <text>{{ t('rider.profile.joined') }}</text><text>{{ profile?.joinedAt || '—' }}</text>
      </view>
      <view class="mt-24rpx">
        {{ t('rider.profile.shops', { shops: profile?.serviceShops.map(s => s.name).join('、') || '—' }) }}
      </view>
    </view>
    <view v-if="error" class="my-24rpx text-26rpx text-red-600">
      {{ error }}
    </view>
    <wd-button block :disabled="loading || !profile || saving" custom-class="!mt-32rpx" @click="save">
      <PageLoading v-if="saving" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
      {{ t('rider.profile.save') }}
    </wd-button>
    <wd-button plain block :disabled="saving" custom-class="!mt-24rpx" @click="refresh">
      {{ t('rider.profile.reload') }}
    </wd-button>
  </view>
</template>
