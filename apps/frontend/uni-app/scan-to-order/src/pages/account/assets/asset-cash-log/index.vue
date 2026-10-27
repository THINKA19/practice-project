<script setup lang="ts">
/**
 * 资金明细（分页，触底加载）
 */
import { useI18n } from 'vue-i18n'
import { usePagingView } from '@/hooks/project/usePagingView'
import { useCashLogPage } from './composables/use-page'

definePage({
  style: {
    navigationBarTitleText: '',
    disableScroll: true,
  },
})

const { t } = useI18n()
const vm = useCashLogPage()
const { list } = vm

const { paging, query, reload } = usePagingView(vm, () => list.value)

onShow(() => {
  uni.setNavigationBarTitle({ title: t('wallet.cashLog.title') })
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
    <view class="cash-log-container">
      <view v-if="list.length" class="px-32rpx">
        <view v-for="item in list" :key="item.id" class="log-card">
          <view class="flex items-center">
            <view class="icon-wrapper" :class="item.amount >= 0 ? 'income' : 'expense'">
              {{ item.amount >= 0 ? '+' : '-' }}
            </view>
            <view class="flex flex-col">
              <text class="text-28rpx text-#333 font-500">
                {{ item.typeStr }}
              </text>
              <text class="mt-6rpx text-22rpx text-#999">
                {{ item.dateAdd }}
              </text>
            </view>
          </view>
          <text class="amount" :class="item.amount >= 0 ? 'income' : 'expense'">
            {{ item.amount >= 0 ? '+' : '-' }}¥{{ Math.abs(item.amount).toFixed(2) }}
          </text>
        </view>
      </view>
    </view>
  </z-paging>
</template>

<style lang="scss" scoped>
.cash-log-container {
  padding-top: 32rpx;
  padding-bottom: 40rpx;
  background: linear-gradient(180deg, #fdf6ef 0%, #fff 100%);
}

.log-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
  margin-bottom: 20rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgb(0 0 0 / 5%);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  margin-right: 20rpx;
  font-size: 36rpx;
  font-weight: 700;
  border-radius: 50%;

  &.income {
    color: #52c41a;
    background: #f0fff0;
  }

  &.expense {
    color: #ff6b6b;
    background: #fff0f0;
  }
}

.amount {
  font-size: 32rpx;
  font-weight: 700;

  &.income {
    color: #52c41a;
  }

  &.expense {
    color: #ff6b6b;
  }
}
</style>
