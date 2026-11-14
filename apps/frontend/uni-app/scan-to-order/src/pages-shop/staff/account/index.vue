<script setup lang="ts">
import { t } from '@/locale'
import { shopText as st } from '@/locale/shop-text'
import { useShopExit } from '@/pages-shop/auth/login'
import { ShopRoutes } from '@/pages-shop/routes'
import { navigate } from '@/utils/project/navigation'
import { useShopAccountPage } from './composables/useShopAccountPage'

definePage({ style: { navigationBarTitleText: '商家账号', navigationStyle: 'custom' } })
const { session, store, workspace, persistenceError } = useShopAccountPage()
const { exiting, goBackClient, logout } = useShopExit()
</script>

<template>
  <view class="box-border min-h-screen bg-[#f5f7f6] text-[#17392a]">
    <wd-navbar custom-style="--wot-navbar-bg: #fff; --wot-navbar-color: #222;" left-arrow safe-area-inset-top :title="t('shop.messages.merchantAccount')" @click-left="goBackClient" />
    <view class="p-32rpx">
      <view class="mb-32rpx rounded-24rpx bg-white p-32rpx">
        <text class="mb-24rpx block text-36rpx">{{ st(session?.name) }}</text>
        <text class="mb-16rpx block">当前门店：{{ st(store.current?.name || '尚未选择') }}</text>
        <text v-if="store.current" class="block">岗位：{{ st(store.current.roleTemplate === 'owner' ? '老板' : '员工') }}</text>
        <text v-if="persistenceError" class="mt-24rpx block">{{ st(persistenceError) }}</text>
      </view>
      <wd-button block :disabled="exiting" @click="workspace">
        {{ st('进入工作台') }}
      </wd-button>
      <wd-button class="mt-24rpx" plain block :disabled="exiting" @click="navigate(ShopRoutes.Management.selectAdmin)">
        {{ st('所属门店与邀请') }}
      </wd-button>
      <wd-button class="mt-24rpx" plain block :disabled="exiting" @click="logout">
        {{ st('退出账号') }}
      </wd-button>
    </view>
  </view>
</template>
