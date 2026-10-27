<script setup lang="ts">
/**
 * 充值记录
 */
import { useI18n } from 'vue-i18n'
import { usePagingView } from '@/hooks/project/usePagingView'
import { useRechargeLogPage } from './composables/use-page'

definePage({
  style: {
    navigationBarTitleText: '',
    disableScroll: true,
  },
})

const { t } = useI18n()
const vm = useRechargeLogPage()
const { list: payLogs } = vm

const { paging, query, reload } = usePagingView(vm, () => payLogs.value)

onShow(() => {
  uni.setNavigationBarTitle({ title: t('wallet.payLog.title') })
  reload()
})
</script>

<template>
  <z-paging ref="paging" :auto="false" :default-page-size="15" :inside-more="true" @query="query">
    <template #loadingMoreDefault>
      <view class="py-24rpx text-center text-24rpx text-#999">
        继续上滑加载更多
      </view>
    </template>
    <template #loadingMoreFail>
      <view class="py-24rpx text-center text-24rpx text-#999">
        加载失败，请下拉刷新后重试
      </view>
    </template>
    <view class="recharge-log-container">
      <template v-if="payLogs.length">
        <view class="summary-card">
          <view class="mr-24rpx text-56rpx">
            🎉
          </view>
          <view class="flex flex-col">
            <text class="text-26rpx text-white/90">
              已加载充值记录
            </text>
            <text class="mt-4rpx text-40rpx text-white font-700">
              {{ payLogs.length }} 次
            </text>
          </view>
        </view>

        <view class="mx-32rpx mt-40rpx">
          <view class="mb-24rpx flex items-center">
            <text class="mr-16rpx text-30rpx text-#333 font-600">
              充值记录
            </text>
            <view class="h-2rpx flex-1 bg-#f0e0d0" />
          </view>

          <view v-for="item in payLogs" :key="item.id" class="recharge-card">
            <view class="flex items-center">
              <view class="icon-circle">
                💰
              </view>
              <view class="flex flex-col">
                <text class="text-28rpx text-#333 font-500">
                  {{ item.payGateStr || item.remark }}
                </text>
                <text class="mt-6rpx text-22rpx text-#999">
                  {{ item.dateUpdate || item.dateAdd }}
                </text>
              </view>
            </view>
            <view class="flex flex-col items-end">
              <view class="flex items-baseline text-#a67c52">
                <text class="text-24rpx font-600">
                  ¥
                </text>
                <text class="text-36rpx font-700">
                  {{ item.money.toFixed(2) }}
                </text>
              </view>
              <view class="success-badge">
                成功
              </view>
            </view>
          </view>
        </view>
      </template>
    </view>
  </z-paging>
</template>

<style lang="scss" scoped>
.recharge-log-container {
  padding-top: 32rpx;
  padding-bottom: 40rpx;
  background: linear-gradient(180deg, #fdf6ef 0%, #fff 100%);
}

.summary-card {
  display: flex;
  align-items: center;
  padding: 36rpx 40rpx;
  margin: 0 32rpx;
  background: linear-gradient(135deg, #ffb88c 0%, #ff8e72 100%);
  border-radius: 28rpx;
  box-shadow: 0 8rpx 28rpx rgb(255 142 114 / 30%);
}

.recharge-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
  margin-bottom: 20rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgb(0 0 0 / 5%);
}

.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  margin-right: 20rpx;
  font-size: 36rpx;
  background: #fff3e6;
  border-radius: 50%;
}

.success-badge {
  padding: 2rpx 14rpx;
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #52c41a;
  background: #f0fff0;
  border-radius: 16rpx;
}
</style>
