<script setup lang="ts">
import { PageState } from '@/components/page-state'
/**
 * 排队取号（tab）：取号类型列表 + 我的号
 */
import { useI18n } from 'vue-i18n'
import { useQueuePage } from './composables/use-page'

definePage({
  style: {
    navigationBarTitleText: '取号',
    disableScroll: true,
  },
})

const { t } = useI18n()
const vm = useQueuePage()
const { list, mylist, loading, failed, recordsFailed, canViewRecords, active, taking } = vm

onShow(() => {
  uni.setNavigationBarTitle({ title: t('tabbar.queue') })
  vm.refresh()
})
</script>

<template>
  <view class="fixed inset-x-0 bottom-[var(--window-bottom,0px)] top-[var(--window-top,0px)] flex flex-col overflow-hidden" style="background: linear-gradient(180deg,#fff5f0 0%,#fff9f6 50%,#fff 100%)">
    <view class="header-section shrink-0">
      <view class="header-decoration" />
      <view class="relative z-1">
        <view class="title-main">
          {{ t('queueFlow.title') }}
        </view>
        <view class="title-sub">
          SMART QUEUE
        </view>
      </view>
    </view>
    <PageState v-if="!list.length && !mylist.length" fill :status="loading ? 'loading' : failed ? 'error' : 'empty'" :title="t(loading ? 'common.loading' : failed ? 'queueFlow.unavailable' : 'queueFlow.empty')" :description="!loading && !failed ? t('queueFlow.emptyHint') : undefined" />
    <z-paging v-else style="--wot-color-theme: #8b4513; flex: 1; min-height: 0" :fixed="false" height="100%" :use-page-scroll="false" :auto="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false" :paging-style="{ background: 'linear-gradient(180deg,#fff5f0 0%,#fff9f6 50%,#fff 100%)' }">
      <view class="queue-container">
        <view class="px-32rpx">
          <PageState v-if="loading || failed || !list.length" :status="loading ? 'loading' : failed ? 'error' : 'empty'" compact :title="t(loading ? 'common.loading' : failed ? 'queueFlow.unavailable' : 'queueFlow.empty')" :description="!loading && !failed ? t('queueFlow.emptyHint') : undefined" />
          <view v-else class="mb-60rpx">
            <view class="section-title">
              <view class="title-dot" />
              <text>{{ t('queueFlow.selectType') }}</text>
            </view>
            <view v-for="item in list" :key="item.id" :class="{ 'opacity-60': taking || recordsFailed || active || (item.status !== undefined && item.status !== 0) }" class="card-item" @tap="vm.queuingGet(item)">
              <view class="card-content">
                <view class="flex flex-1 items-center">
                  <view class="mr-24rpx text-64rpx">
                    ☕
                  </view>
                  <view class="flex-1">
                    <view class="card-name">
                      {{ item.name }}
                    </view>
                    <view class="text-24rpx text-#999">
                      {{ t(item.status !== undefined && item.status !== 0 ? 'queueFlow.paused' : active ? 'queueFlow.hasActive' : 'queueFlow.take') }}
                    </view>
                  </view>
                </view>
                <view class="pl-24rpx text-right">
                  <view class="mb-8rpx flex items-baseline justify-end">
                    <view class="current-num">
                      {{ t('queueFlow.current') }} {{ item.curNumber }}
                    </view>
                    <view class="ml-4rpx text-28rpx text-#999">
                      / {{ t('queueFlow.issued') }} {{ item.numberGet }}
                    </view>
                  </view>
                  <view class="text-22rpx text-#999">
                    {{ t('queueFlow.waitingTables') }}: {{ item.numberWait }}
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view v-if="mylist.length > 0" class="mt-60rpx">
            <view class="section-title">
              <view class="title-dot" />
              <text>{{ t('queue.myNumber') }}</text>
            </view>
            <view class="flex flex-col gap-24rpx">
              <view v-for="item in mylist" :key="item.id" class="my-queue-card">
                <view class="my-card-bg-decoration" />
                <view class="relative z-1 mb-24rpx flex items-center justify-between">
                  <view class="my-card-type">
                    {{ item.typeEntity?.name }}
                  </view>
                  <view class="my-card-number">
                    {{ item.number }}
                  </view>
                </view>
                <view v-if="item.status === 0" class="relative mb-16rpx text-26rpx text-[#8b6f47]">
                  {{ t('queueFlow.ahead') }}: {{ item.aheadTables ?? '—' }}
                </view>
                <view v-if="item.status === 0 || item.status === 1" class="relative z-1 mb-20rpx flex gap-16rpx">
                  <wd-button v-if="item.status === 0 || item.status === 1" custom-class="!bg-[#8b4513] !border-[#8b4513] !text-white" :disabled="taking" @click="vm.cancel(item.id)">
                    {{ t('queueFlow.cancel') }}
                  </wd-button>
                </view>
                <view class="relative z-1 flex flex-wrap items-center gap-16rpx">
                  <view class="status-tag">
                    {{ t(`queueFlow.status${item.status}`) }}
                  </view>
                  <view v-if="item.waitMinitus" class="flex items-center text-26rpx text-#666">
                    <text class="mr-8rpx text-28rpx">
                      ⏱
                    </text>
                    <text>{{ t('queue.ExpectedWaiting') }}: {{ item.waitMinitus }}{{ t('queue.minutes') }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <PageState v-if="!loading && canViewRecords && !mylist.length && (list.length || recordsFailed)" :status="recordsFailed ? 'error' : 'empty'" compact :title="t(recordsFailed ? 'queueFlow.recordsUnavailable' : 'queueFlow.noRecords')" />
        </view>
      </view>
    </z-paging>
  </view>
</template>

<style lang="scss" scoped>
.queue-container {
  padding-bottom: 40rpx;
}

.header-section {
  position: relative;
  padding: 60rpx 0 80rpx;
  overflow: hidden;
  text-align: center;
}

.header-decoration {
  position: absolute;
  top: -100rpx;
  left: 50%;
  width: 400rpx;
  height: 400rpx;
  background: radial-gradient(circle, rgb(199 147 115 / 10%) 0%, transparent 70%);
  border-radius: 50%;
  transform: translateX(-50%);
}

.title-main {
  margin-bottom: 8rpx;
  font-size: 56rpx;
  font-weight: 600;
  color: #4a3428;
  letter-spacing: 4rpx;
}

.title-sub {
  font-size: 24rpx;
  font-weight: 300;
  color: #c79373;
  letter-spacing: 6rpx;
}

.section-title {
  display: flex;
  align-items: center;
  padding-left: 8rpx;
  margin-bottom: 32rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #4a3428;
}

.title-dot {
  width: 8rpx;
  height: 32rpx;
  margin-right: 16rpx;
  background: linear-gradient(180deg, #c79373 0%, #d4a574 100%);
  border-radius: 4rpx;
}

.card-item {
  position: relative;
  margin-bottom: 24rpx;
  overflow: hidden;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgb(199 147 115 / 12%);
  animation: fade-in-up 0.5s ease-out;

  &:active {
    transform: scale(0.98);
  }
}

.card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 28rpx;
}

.card-name {
  margin-bottom: 8rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #4a3428;
}

.current-num {
  font-size: 48rpx;
  font-weight: 700;
  line-height: 1;
  color: #c79373;
}

.my-queue-card {
  position: relative;
  padding: 32rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #fff 0%, #fff9f6 100%);
  border: 2rpx solid rgb(199 147 115 / 10%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgb(199 147 115 / 15%);
  animation: fade-in-up 0.5s ease-out;
}

.my-card-bg-decoration {
  position: absolute;
  top: -40rpx;
  right: -40rpx;
  width: 160rpx;
  height: 160rpx;
  background: radial-gradient(circle, rgb(199 147 115 / 8%) 0%, transparent 70%);
  border-radius: 50%;
}

.my-card-type {
  font-size: 32rpx;
  font-weight: 600;
  color: #4a3428;
}

.my-card-number {
  font-family:
    'DIN Alternate',
    -apple-system,
    sans-serif;
  font-size: 56rpx;
  font-weight: 700;
  color: #c79373;
}

.status-tag {
  display: inline-block;
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #c79373;
  background: linear-gradient(135deg, #ffe8dc 0%, #ffd4c4 100%);
  border-radius: 32rpx;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
