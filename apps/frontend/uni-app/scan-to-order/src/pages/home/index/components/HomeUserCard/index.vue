<!--
============================================================================
【文件概述】首页用户卡展示组件，通过事件交由首页处理导航。
【方法与导出清单】默认 Vue 组件；avatar、nick、levelName 属性；member、coupon 事件。
【综合使用示例】
import HomeUserCard from '@/pages/home/index/components/HomeUserCard/index.vue'
// 在首页模板使用：<HomeUserCard :avatar="avatar" :nick="nick" :level-name="levelName" @member="vm.openMemberCenter" @coupon="vm.openCoupons" />
============================================================================
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/language-switcher/index.vue'
import { CustomerProfile } from '@/pages/account/index'

defineOptions({ name: 'HomeUserCard' })

defineProps<{
  hasLogin?: boolean
  avatar: string
  nick: string
  levelName: string
}>()

const emit = defineEmits<{
  login: []
  member: []
  coupon: []
}>()

const { t } = useI18n()
</script>

<template>
  <view class="user-card">
    <view class="flex flex-wrap items-center gap-16rpx">
      <view class="min-w-0 flex flex-auto">
        <CustomerProfile
          :has-login="hasLogin"
          :avatar="avatar"
          :nick="nick"
          :level-name="levelName"
          @login="emit('login')"
          @avatar="emit('member')"
          @profile="emit('member')"
          @member="emit('member')"
        />
      </view>
      <view class="ml-auto min-w-0 max-w-full">
        <LanguageSwitcher />
      </view>
    </view>
    <view class="grid grid-cols-2 gap-16rpx">
      <button class="card-action member-entry" @tap="emit('member')">
        {{ t('market.member') }}
      </button>
      <button class="card-action coupon-btn" @tap="emit('coupon')">
        {{ t('coupons.title') }}
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.user-card {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx 28rpx;
  margin: 20rpx 32rpx 0;
  background: #fffcfa;
  border-radius: 28rpx;
  box-shadow: 0 6rpx 24rpx rgb(116 66 46 / 8%);
}

.user-card :deep(.profile-avatar) {
  width: 88rpx;
  height: 88rpx;
}

.user-card :deep(.customer-profile) {
  gap: 16rpx;
}

.user-card :deep(.profile-name) {
  font-size: 30rpx;
}

.card-action {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 0;
  min-height: 64rpx;
  padding: 10rpx 16rpx;
  margin: 0;
  border-radius: 32rpx;
  font-size: 26rpx;
  line-height: 1.4;
}

.card-action::after {
  border: none;
}

.member-entry {
  color: #634b36;
  background: #f4ebe0;
}

.coupon-btn {
  color: #a42d56;
  background: #fce5ed;
}
</style>
