<script setup lang="ts">
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useMemberCenterPage } from './composables/use-page'

definePage({ style: { navigationBarTitleText: '会员中心', enablePullDownRefresh: true } })
const { t } = useI18n()
const { user, demo, totalConsumed, levelList, levelFailed, levelLoading, levelsAvailable, loading, failed, refresh, login } = useMemberCenterPage()
onShow(() => {
  void refresh()
})
onPullDownRefresh(async () => {
  try {
    await refresh()
  }
  finally { uni.stopPullDownRefresh() }
})
</script>

<template>
  <view class="member-container">
    <view class="top-wave" />
    <view v-if="demo" class="relative z-1 px-32rpx pt-24rpx text-center text-24rpx text-white">
      开发演示：等级和资产为测试数据
    </view>
    <button v-if="!user" class="member-login relative z-1 mx-32rpx mt-24rpx" @tap="login">
      点击登录成为会员
    </button>

    <!-- 会员卡片 -->
    <view class="member-card">
      <view class="flex items-center">
        <image mode="aspectFill" class="avatar" :src="user?.avatar || '/static/images/default-avatar.png'" />
        <view class="ml-24rpx flex-1">
          <view class="mb-8rpx text-34rpx text-white font-600">
            {{ user?.nickname || user?.username || '未登录' }}
          </view>
          <view class="text-24rpx text-white/85">
            <text>{{ t('vip.consumption') }}</text>
            <text class="ml-8rpx font-600">
              ￥{{ totalConsumed ?? '—' }}
            </text>
          </view>
        </view>
      </view>
      <view class="mt-32rpx flex items-center justify-between">
        <view class="level-badge">
          <text class="mr-8rpx">
            {{ user?.userLevel ? '👑' : '✨' }}
          </text>
          <text>{{ user?.userLevel?.name || t('vip.notVIP') }}</text>
        </view>
        <view class="text-22rpx text-white/80">
          {{ t('vip.tip') }}
        </view>
      </view>
    </view>

    <view class="relative mx-32rpx h-40rpx pt-16rpx text-24rpx text-#8B7355" role="status">
      <text v-if="loading">资产加载中…</text>
    </view>
    <button v-if="failed || levelFailed" class="relative mx-32rpx mt-32rpx" @tap="refresh">
      加载失败，点击重试
    </button>
    <!-- 等级体系 -->
    <view class="mx-32rpx mt-48rpx">
      <view class="mb-24rpx flex items-center justify-center">
        <view class="header-line" />
        <view class="mx-24rpx text-32rpx text-#333 font-600">
          {{ t('vip.growth') }}
        </view>
        <view class="header-line" />
      </view>

      <view class="h-48rpx text-center text-24rpx text-#999" role="status">
        <text v-if="levelLoading">{{ levelList.length ? '正在更新等级…' : '等级加载中…' }}</text>
      </view>
      <view v-if="!levelLoading && !levelsAvailable" class="py-24rpx text-center text-#999">
        会员等级服务暂未接入
      </view>
      <view v-else-if="!levelLoading && !levelFailed && !levelList.length" class="py-24rpx text-center text-#999">
        暂无等级规则
      </view>
      <view v-if="levelList.length" class="table-header">
        <view class="flex-1 text-center">
          {{ t('vip.growthName') }}
        </view>
        <view class="flex-1 text-center">
          {{ t('vip.growthDiscount') }}
        </view>
        <view class="flex-1 text-center">
          {{ t('vip.growthConsumption') }}
        </view>
      </view>

      <view v-for="item in levelList" :key="item.id" class="level-card-item">
        <view class="level-col">
          <view class="level-label">
            等级
          </view>
          <view class="level-value text-#8B7355">
            {{ item.name }}
          </view>
        </view>
        <view class="level-col">
          <view class="level-label">
            折扣
          </view>
          <view class="level-value text-#ff6b6b">
            {{ item.rebate ?? '—' }}{{ item.rebate != null ? '折' : '' }}
          </view>
        </view>
        <view class="level-col">
          <view class="level-label">
            消费额
          </view>
          <view class="level-value">
            ￥{{ item.upgradeAmount ?? '—' }}
          </view>
        </view>
      </view>
    </view>

    <view class="mx-32rpx mt-32rpx flex items-start rounded-20rpx bg-#FFF8E6 p-24rpx">
      <view class="mr-12rpx">
        ℹ️
      </view>
      <view class="flex-1 text-24rpx text-#8B7355 leading-relaxed">
        {{ t('vip.profile') }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.member-login {
  color: #fff;
  background: #557660;
  border-radius: 48rpx;
  font-size: 28rpx;

  &::after {
    border: none;
  }
}

.member-container {
  position: relative;
  min-height: 100vh;
  padding-bottom: 60rpx;
  background: #fdf8f3;
}

.top-wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 320rpx;
  background: linear-gradient(135deg, #d4a373 0%, #a67c52 100%);
  border-radius: 0 0 60rpx 60rpx;
}

.member-card {
  position: relative;
  z-index: 1;
  padding: 40rpx 32rpx;
  margin: 0 32rpx;
  margin-top: 40rpx;
  background: linear-gradient(135deg, #8b7355 0%, #c19a6b 100%);
  border-radius: 32rpx;
  box-shadow: 0 12rpx 40rpx rgb(139 115 85 / 30%);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border: 4rpx solid rgb(255 255 255 / 80%);
  border-radius: 50%;
}

.level-badge {
  display: flex;
  align-items: center;
  padding: 8rpx 24rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #8b7355;
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  border-radius: 32rpx;
}

.header-line {
  width: 80rpx;
  height: 2rpx;
  background: #d4a373;
}

.table-header {
  display: flex;
  padding: 20rpx 0;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  color: #999;
}

.level-card-item {
  display: flex;
  padding: 28rpx 0;
  margin-bottom: 16rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgb(0 0 0 / 5%);
}

.level-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
}

.level-label {
  margin-bottom: 8rpx;
  font-size: 22rpx;
  color: #bbb;
}

.level-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}
</style>
