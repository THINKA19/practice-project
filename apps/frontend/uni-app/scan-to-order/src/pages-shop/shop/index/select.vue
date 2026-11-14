<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import { t } from '@/locale'
import { shopText as st } from '@/locale/shop-text'
import { watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useShopSelect } from './composables/useShopSelect'

definePage({ style: { navigationBarTitleText: '选择管理门店' } })
const { store, choose, logout, acceptInvite, accepting } = useShopSelect()

onShow(() => uni.setNavigationBarTitle({ title: t('shop.messages.selectAStore') }))
watch(() => t('shop.messages.selectAStore'), title => uni.setNavigationBarTitle({ title }))
</script>

<template>
  <view class="box-border min-h-screen bg-[#f5f7f6] p-32rpx">
    <text class="mb-24rpx block">{{ st('选择当前工作的门店') }}</text>
    <text v-if="store.error" class="mb-24rpx block">{{ st(store.error) }}</text>
    <view v-for="shop in store.shops" :key="shop.id" class="mb-24rpx rounded-16rpx bg-white p-24rpx">
      <text class="mb-16rpx block">{{ st(shop.name) }} · {{ st(shop.roleTemplate === 'owner' ? '老板' : '员工') }}</text>
      <wd-button :disabled="store.loading" @click="choose(shop.id)">
        <PageLoading v-if="store.loading" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
        {{ st(store.current?.id === shop.id ? '进入当前门店' : '进入门店') }}
      </wd-button>
    </view>
    <wd-button plain :disabled="store.loading" @click="store.refresh">
      <PageLoading v-if="store.loading" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
      {{ st('重新获取门店') }}
    </wd-button>
    <wd-button plain :disabled="accepting" @click="acceptInvite">
      <PageLoading v-if="accepting" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
      {{ st('接受门店邀请') }}
    </wd-button>
    <wd-button plain @click="logout">
      {{ st('退出账号') }}
    </wd-button>
  </view>
</template>
