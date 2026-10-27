<script setup lang="ts">
/**
 * 礼品卡消费明细（下拉刷新、触底加载）
 */
import { useCardLogsPage } from './composables/use-logs-page'

definePage({
  style: {
    navigationBarTitleText: '礼品卡消费明细',
    enablePullDownRefresh: true,
  },
})
const vm = useCardLogsPage()
const { list, loaded, failed } = vm
onLoad((query) => {
  vm.init(query as {
    cardId?: string
  })
})
onPullDownRefresh(async () => {
  await vm.refresh()

  uni.stopPullDownRefresh()
})
onReachBottom(() => {
  vm.loadMore()
})
</script>

<template>
  <view class="page-container">
    <view v-if="failed">
      明细加载失败<button @tap="vm.refresh()">
        重试
      </button>
    </view>
    <view class="header-decoration">
      <view class="decoration-circle circle-1" />
      <view class="decoration-circle circle-2" />
      <view class="decoration-wave" />
    </view>

    <view class="relative z-1 px-32rpx pb-32rpx pt-40rpx">
      <view class="overview-content">
        <view class="mr-24rpx text-68rpx">
          ☕
        </view>
        <view class="flex flex-1 flex-col">
          <text class="mb-8rpx text-36rpx text-#3D2F26 font-600">
            消费记录
          </text>
          <text class="text-22rpx text-#A0826D tracking-1rpx uppercase">
            Card Consumption Record
          </text>
        </view>
      </view>
    </view>

    <view v-if="loaded && !list.length" class="empty-container">
      <view class="mb-32rpx text-120rpx opacity-80">
        📋
      </view>
      <view class="mb-16rpx text-32rpx text-#666 font-500">
        暂无消费记录
      </view>
      <view class="px-20rpx text-26rpx text-#999 leading-relaxed">
        使用礼品卡消费后，记录会显示在这里哦～
      </view>
    </view>

    <view v-else class="relative z-1 px-32rpx">
      <view v-for="item in list" :key="item.id" class="timeline-item">
        <view class="timeline-dot">
          <view class="dot-inner" />
        </view>
        <view class="record-card">
          <view class="mb-24rpx flex items-center justify-between">
            <view class="type-badge">
              <text class="mr-8rpx text-28rpx">
                💳
              </text>
              <text class="text-28rpx text-#A0826D font-500">
                {{ item.typeStr }}
              </text>
            </view>
            <view class="text-24rpx text-#999">
              {{ item.dateAdd }}
            </view>
          </view>
          <view class="card-body">
            <view class="flex items-center justify-between">
              <view class="text-26rpx text-#666">
                消费金额
              </view>
              <view class="flex items-baseline text-#FF6B6B">
                <text class="mr-4rpx text-32rpx font-600">
                  -
                </text>
                <text class="text-44rpx font-700">
                  {{ item.amount }}
                </text>
              </view>
            </view>
            <view class="divider" />
            <view class="flex flex-col gap-8rpx">
              <text class="text-24rpx text-#999">
                剩余余额
              </text>
              <text class="text-36rpx text-#52C41A font-600">
                {{ item.balance }}
              </text>
            </view>
          </view>
          <view class="card-decoration">
            <view class="deco-line" />
          </view>
        </view>
      </view>
    </view>
    <view class="h-60rpx" />
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  position: relative;
  min-height: 100vh;
  padding-bottom: 40rpx;
  background: linear-gradient(180deg, #f5f0eb 0%, #fdfbf9 100%);
}

.header-decoration {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 0;
  height: 280rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #d4b5a0 0%, #a0826d 100%);
}

.decoration-circle {
  position: absolute;
  background: rgb(255 255 255 / 10%);
  border-radius: 50%;
}

.circle-1 {
  top: -100rpx;
  right: -50rpx;
  width: 300rpx;
  height: 300rpx;
}

.circle-2 {
  bottom: -80rpx;
  left: -40rpx;
  width: 200rpx;
  height: 200rpx;
}

.decoration-wave {
  position: absolute;
  right: 0;
  bottom: -2rpx;
  left: 0;
  height: 60rpx;
  background: #f5f0eb;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
}

.overview-content {
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx;
  background: rgb(255 255 255 / 95%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgb(160 130 109 / 12%);
}

.empty-container {
  position: relative;
  z-index: 1;
  padding: 100rpx 40rpx 80rpx;
  margin: 120rpx 32rpx;
  text-align: center;
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 24rpx rgb(0 0 0 / 4%);
}

.timeline-item {
  position: relative;
  padding-left: 60rpx;
  margin-bottom: 32rpx;

  &:not(:last-child)::before {
    position: absolute;
    top: 60rpx;
    bottom: -32rpx;
    left: 22rpx;
    width: 2rpx;
    content: '';
    background: linear-gradient(180deg, #d4b5a0 0%, rgb(212 181 160 / 30%) 100%);
  }
}

.timeline-dot {
  position: absolute;
  top: 24rpx;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46rpx;
  height: 46rpx;
  background: linear-gradient(135deg, #d4b5a0, #a0826d);
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgb(160 130 109 / 30%);
}

.dot-inner {
  width: 16rpx;
  height: 16rpx;
  background: #fff;
  border-radius: 50%;
}

.record-card {
  position: relative;
  padding: 32rpx;
  overflow: hidden;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgb(0 0 0 / 6%);

  &::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 4rpx;
    content: '';
    background: linear-gradient(90deg, #d4b5a0, #a0826d);
  }
}

.type-badge {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx;
  background: linear-gradient(135deg, #fff5ee, #f5ebe0);
  border: 1rpx solid rgb(160 130 109 / 15%);
  border-radius: 40rpx;
}

.card-body {
  padding: 28rpx 24rpx;
  background: linear-gradient(135deg, #fdfbf9 0%, #f9f6f3 100%);
  border-radius: 16rpx;
}

.divider {
  height: 1rpx;
  margin: 24rpx 0;
  background: linear-gradient(90deg, rgb(160 130 109 / 0%) 0%, rgb(160 130 109 / 20%) 50%, rgb(160 130 109 / 0%) 100%);
}

.card-decoration {
  padding-top: 20rpx;
  margin-top: 24rpx;
  border-top: 1rpx dashed rgb(160 130 109 / 20%);
}

.deco-line {
  height: 6rpx;
  background: linear-gradient(90deg, #d4b5a0 0%, #a0826d 50%, #d4b5a0 100%);
  border-radius: 3rpx;
  opacity: 0.3;
}
</style>
