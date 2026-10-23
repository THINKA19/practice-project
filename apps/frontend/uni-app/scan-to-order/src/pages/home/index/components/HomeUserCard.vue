<!--
============================================================================
【文件概述】首页用户卡展示组件，通过事件交由首页处理导航。
【方法与导出清单】默认 Vue 组件；avatar、nick、levelName 属性；member、coupon 事件。
【综合使用示例】
import HomeUserCard from '@/pages/home/index/components/HomeUserCard.vue'
// 在首页模板使用：<HomeUserCard :avatar="avatar" :nick="nick" :level-name="levelName" @member="vm.openMemberCenter" @coupon="vm.openCoupons" />
============================================================================
-->
<script setup lang="ts">
/**
 * 首页用户卡片（纯展示）：头像、昵称、会员等级、优惠券入口
 */
import { useI18n } from 'vue-i18n'
import LocalePicker from '@/components/locale/index.vue'

defineProps<{
  avatar: string
  nick: string
  levelName: string
}>()

const emit = defineEmits<{
  member: []
  coupon: []
}>()

const { t } = useI18n()
</script>

<template>
  <view class="user-card">
    <view class="min-w-0 flex flex-1 items-center" @tap="emit('member')">
      <image class="user-avatar" :src="avatar" mode="aspectFill" />
      <view class="ml-24rpx min-w-0 flex flex-col gap-8rpx">
        <view class="break-words text-32rpx text-#333 font-600">
          {{ nick || t('home.user.guest') }}
        </view>
        <view class="flex">
          <wd-tag type="warning" round size="medium">
            {{ levelName || t('vip.title') }}
          </wd-tag>
        </view>
      </view>
    </view>
    <view class="flex flex-wrap items-center justify-end gap-16rpx">
      <LocalePicker icon-only />
      <view class="coupon-btn" @tap="emit('coupon')">
        <text class="mr-4rpx">
          {{ t('coupons.title') }}
        </text>
        <wd-icon name="arrow-right" size="14px" color="#fff" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.user-card {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 24rpx;
  justify-content: space-between;
  padding: 32rpx;
  margin: 32rpx 32rpx 0;
  background: linear-gradient(135deg, #fff 0%, #fff9f6 100%);
  border-radius: 28rpx;
  box-shadow: 0 8rpx 32rpx rgb(255 107 157 / 12%);
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border: 4rpx solid #ffe8f0;
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx rgb(255 107 157 / 20%);
}

.coupon-btn {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  color: #fff;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
  border-radius: 40rpx;
  box-shadow: 0 4rpx 16rpx rgb(255 107 157 / 30%);
}
</style>
