<script setup lang="ts">
/**
 * 我的-用户信息卡片（纯展示）：头像（chooseAvatar）、昵称、UID、会员等级、会员码入口
 */
import { useI18n } from 'vue-i18n'

defineProps<{
  myBg?: string
  avatar: string
  nick: string
  uid?: number | string
  levelName?: string
}>()

const emit = defineEmits<{
  chooseAvatar: [avatarUrl: string]
  editNick: []
  copyUid: []
  vip: []
  userCode: []
}>()

const { t } = useI18n()
</script>

<template>
  <view class="header-section">
    <image v-if="myBg" mode="aspectFill" class="header-bg" :src="myBg" />
    <view class="header-gradient" />
    <view class="user-card">
      <view class="flex items-center justify-between">
        <view class="relative mr-24rpx">
          <button class="avatar-btn" @tap="emit('chooseAvatar', '')">
            <image :src="avatar" mode="aspectFill" class="avatar-img" />
          </button>
        </view>
        <view class="flex flex-1 flex-col justify-center">
          <view class="nickname" @tap="emit('editNick')">
            {{ nick || t('account.nickSet') }}
          </view>
          <view class="mb-12rpx flex items-center" @tap="emit('copyUid')">
            <text class="mr-8rpx text-24rpx text-#999">
              {{ t('account.uid') }}
            </text>
            <text class="text-24rpx text-#666 font-mono">
              {{ uid }}
            </text>
          </view>
          <view class="vip-badge" @tap="emit('vip')">
            <text class="block text-22rpx text-white font-500 leading-none">
              {{ levelName || t('account.notVIP') }}
            </text>
          </view>
        </view>
        <view class="flex flex-col items-center justify-center px-16rpx py-8rpx" @tap="emit('userCode')">
          <view class="qr-icon-wrapper">
            <wd-icon name="qrcode" size="24px" color="#8B7355" />
          </view>
          <view class="text-22rpx text-#8B7355 font-500">
            {{ t('account.userCode') }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.header-section {
  position: relative;
  width: 100%;
  height: 280rpx;
  overflow: visible;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.9;
  filter: blur(20rpx);
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgb(245 222 179 / 90%) 0%,
    rgb(210 180 140 / 85%) 50%,
    rgb(139 115 85 / 80%) 100%
  );
}

.user-card {
  position: absolute;
  right: 32rpx;
  bottom: -64rpx;
  left: 32rpx;
  z-index: 10;
  padding: 40rpx 32rpx;
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 32rpx rgb(139 115 85 / 15%);
}

.avatar-btn {
  width: 140rpx;
  height: 140rpx;
  padding: 0;
  margin: 0;
  overflow: visible;
  background: transparent;
  border: none;
  border-radius: 50%;

  &::after {
    border: none;
  }
}

.avatar-img {
  width: 140rpx;
  height: 140rpx;
  border: 6rpx solid #fff;
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx rgb(139 115 85 / 20%);
}

.nickname {
  max-width: 300rpx;
  margin-bottom: 8rpx;
  overflow: hidden;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vip-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 40rpx;
  line-height: 1;
  align-self: flex-start;
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  border-radius: 20rpx;
}

.qr-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  margin-bottom: 8rpx;
  background: linear-gradient(135deg, #fff5e6 0%, #ffe4b5 100%);
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgb(139 115 85 / 15%);
}
</style>
