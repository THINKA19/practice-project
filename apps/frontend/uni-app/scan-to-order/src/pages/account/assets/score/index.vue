<script setup lang="ts">
/**
 * 积分明细（分页，触底加载）
 */
import { useI18n } from 'vue-i18n'
import { usePagingView } from '@/hooks/project/usePagingView'
import { useScoreLogsPage } from './composables/use-logs-page'

definePage({
  style: {
    navigationBarTitleText: '',
    disableScroll: true,
  },
})

const vm = useScoreLogsPage()
const { t } = useI18n()
const { list } = vm

const { paging, query, reload } = usePagingView(vm, () => list.value)

onShow(() => {
  uni.setNavigationBarTitle({ title: t('wallet.scoreLog.title') })
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
    <view class="score-logs-container">
      <view class="wave-bg" />
      <view class="relative z-1 px-32rpx pt-32rpx">
        <template v-if="list.length">
          <view v-for="item in list" :key="item.id" class="log-card">
            <view class="flex items-center">
              <view class="icon-wrapper" :class="item.score > 0 ? 'icon-add' : 'icon-minus'">
                {{ item.score > 0 ? '+' : '-' }}
              </view>
              <view class="flex flex-col">
                <view class="text-28rpx text-#333 font-500">
                  {{ item.typeStr }}
                </view>
                <view class="mt-6rpx text-22rpx text-#999">
                  {{ item.dateAdd }}
                </view>
              </view>
            </view>
            <view class="flex flex-col items-end">
              <view class="text-36rpx font-700" :class="item.score > 0 ? 'text-#ff8c42' : 'text-#999'">
                {{ item.score > 0 ? '+' : '' }}{{ item.score }}
              </view>
              <view class="text-20rpx text-#bbb">
                积分
              </view>
            </view>
          </view>
        </template>
      </view>
    </view>
  </z-paging>
</template>

<style lang="scss" scoped>
.score-logs-container {
  position: relative;
  padding-bottom: 40rpx;
  background: #fdf8f3;
}

.wave-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 240rpx;
  background: linear-gradient(135deg, #ffd89b 0%, #ffb88c 100%);
  border-radius: 0 0 50rpx 50rpx;
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
}

.icon-add {
  color: #ff8c42;
  background: #fff3e6;
}

.icon-minus {
  color: #999;
  background: #f5f5f5;
}
</style>
