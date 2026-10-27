<script setup lang="ts">
/** 我的用户卡：共用顾客身份展示，保留会员码入口。 */
import { useI18n } from 'vue-i18n'
import CustomerProfile from '../CustomerProfile/index.vue'

defineOptions({ name: 'MyUserCard' })

defineProps<{ myBg?: string, avatar: string, nick: string, hasLogin?: boolean, levelName?: string }>()
const emit = defineEmits<{ chooseAvatar: [avatarUrl: string], editNick: [], login: [], vip: [], userCode: [] }>()
const { t } = useI18n()
</script>

<template>
  <view class="header-section">
    <image v-if="myBg" mode="aspectFill" class="header-bg" :src="myBg" />
    <view class="header-gradient" />
    <view class="user-card">
      <view class="flex items-center justify-between gap-16rpx">
        <CustomerProfile
          :has-login="hasLogin"
          :avatar="avatar"
          :nick="nick"
          :level-name="hasLogin ? levelName || t('account.notVIP') : undefined"
          @login="emit('login')"
          @avatar="emit('chooseAvatar', '')"
          @profile="emit('editNick')"
          @member="emit('vip')"
        />
        <view class="member-code-entry flex flex-col items-center justify-center px-16rpx py-8rpx" @tap="emit('userCode')">
          <view class="qr-icon-wrapper">
            <wd-icon name="qrcode" size="24px" color="#7353AD" />
          </view>
          <view class="text-22rpx text-#7353AD font-500">
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
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 280rpx;
  padding: 40rpx 32rpx;
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
  background:
    radial-gradient(ellipse at 12% 15%, rgb(255 239 251 / 85%) 0%, rgb(255 239 251 / 0%) 55%),
    radial-gradient(ellipse at 90% 85%, rgb(183 195 255 / 75%) 0%, rgb(183 195 255 / 0%) 55%),
    linear-gradient(125deg, #e9ddfc 0%, #cbb5ee 48%, #b6a0e4 100%);
}

.user-card {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  z-index: 10;
  padding: 40rpx 32rpx;
  background: linear-gradient(115deg, #fff 0%, #fdfbff 60%, #f4f0ff 100%);
  border-radius: 32rpx;
  box-shadow:
    inset 0 0 0 2rpx rgb(255 255 255 / 85%),
    0 12rpx 32rpx rgb(100 70 155 / 16%),
    0 2rpx 8rpx rgb(100 70 155 / 5%);
}

.qr-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  margin-bottom: 8rpx;
  background: linear-gradient(135deg, #f5eaff 0%, #e7dcfc 50%, #dce3ff 100%);
  border-radius: 50%;
  box-shadow:
    inset 0 0 0 2rpx rgb(255 255 255 / 80%),
    0 4rpx 14rpx rgb(115 83 173 / 16%);
}
</style>
