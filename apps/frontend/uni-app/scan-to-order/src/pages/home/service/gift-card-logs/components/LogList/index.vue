<!--
============================================================================
【文件概述】
礼品卡记录领域展示层；接收响应式状态并委托控制器处理交互，不直接调用接口。

【方法与导出清单】
LogList：默认组件；vm 为 ReturnType<typeof useCardLogsPage>，由同领域页面创建。

【综合使用示例】
```typescript
import LogList from './components/LogList/index.vue'
import { useCardLogsPage } from './composables/use-page'
const vm = useCardLogsPage() // 在父页面 setup 中调用
// 页面模板：<LogList :vm="vm" />
```
============================================================================
-->
<script setup lang="ts">
import type { useCardLogsPage } from '../../composables/use-page'
import { myCardState } from '../../../gift-card'
import { cardLogAmount, cardLogTitle } from '../../domain/log.rules'

const { vm } = defineProps<{ vm: ReturnType<typeof useCardLogsPage> }>()
const section = defineModel<'details' | 'records'>('section', { default: 'records' })
const isDemo = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
const { card, list, loaded, failed, loading, invalidCard, hasMore } = vm
</script>

<template>
  <view class="detail-page">
    <view class="detail-tabs" role="tablist" aria-label="礼品卡详情">
      <button class="detail-tab" :class="{ 'detail-tab-selected': section === 'details' }" role="tab" :aria-selected="section === 'details'" @tap="section = 'details'">
        卡片信息
      </button>
      <button class="detail-tab" :class="{ 'detail-tab-selected': section === 'records' }" role="tab" :aria-selected="section === 'records'" @tap="section = 'records'">
        使用与赠送记录
      </button>
    </view>
    <view v-if="card" class="card-summary">
      <view class="text-32rpx font-600">
        {{ card.cardInfo?.name || '礼品卡' }}
      </view>
      <view class="mt-24rpx text-24rpx">
        {{ card.type === 0 ? '剩余次数' : '可用余额' }}
      </view>
      <view class="text-48rpx font-700">
        {{ card.type === 0 ? `${card.amount} 次` : `¥${card.amount}` }}
      </view>
      <view v-if="card.dateEnd" class="mt-12rpx text-24rpx">
        有效期至 {{ card.dateEnd }}
      </view>
      <view class="mt-12rpx text-24rpx">
        卡片编号：{{ card.id }}
      </view>
      <view class="mt-12rpx text-24rpx">
        赠送状态：{{ myCardState(card) === 'sharing' ? '赠送中' : myCardState(card) === 'canShare' ? '可赠送' : myCardState(card) === 'expired' ? '已过期' : myCardState(card) === 'empty' ? '已用完' : '不可转赠' }}
      </view>
      <view v-if="card.fromUser" class="mt-12rpx text-24rpx">
        赠送人：{{ card.fromUser.nick || '微信用户' }}
      </view>
    </view>

    <view v-if="section === 'details' && card" class="record-row mt-24rpx">
      <view class="mb-16rpx text-30rpx font-600">
        使用说明
      </view>
      <view class="text-26rpx leading-relaxed">
        {{ card.type === 0 ? '这是次数卡，权益以剩余次数显示。' : card.type === 1 ? '这是储值卡，权益以可用余额显示。' : '请以卡片显示的可用权益为准。' }}
        请在有效期内使用。赠送中的卡如需自己保留，请先撤回赠送。
      </view>
    </view>
    <template v-if="section === 'records' || !card">
      <view v-if="section === 'records' && isDemo && card" class="my-24rpx">
        <view class="text-24rpx">
          开发演示：只修改当前演示卡，不产生真实订单或退款。
        </view>
        <button :disabled="vm.demoBusy.value" @tap="vm.demoAction('consume')">
          模拟消费
        </button>
        <button :disabled="vm.demoBusy.value" @tap="vm.demoAction('refund')">
          返还一笔演示消费
        </button>
      </view>
      <view class="mb-16rpx mt-24rpx text-32rpx font-600">
        明细记录
      </view>
      <view v-if="invalidCard" class="record-state">
        卡片信息有误，请从「我的」重新打开。
      </view>
      <view v-else-if="loading && !list.length" class="record-state">
        正在加载明细记录…
      </view>
      <view v-else-if="loaded && !failed && !list.length" class="record-state">
        暂无明细记录。未使用的卡片没有消费记录，记录以服务端返回为准。
      </view>

      <view v-for="item in list" :key="item.id" class="record-row">
        <view class="flex items-start justify-between gap-16rpx">
          <view>
            <view class="text-28rpx font-600">
              {{ cardLogTitle(item) }}
            </view>
            <view v-if="item.remark" class="mt-8rpx text-26rpx text-#665d56">
              {{ item.remark }}
            </view>
          </view>
          <text class="shrink-0 text-30rpx text-#a74736 font-600">
            {{ cardLogAmount(item, card?.type) }}
          </text>
        </view>
        <view class="mt-12rpx flex flex-wrap justify-between gap-8rpx text-24rpx text-#766b63">
          <text>{{ item.dateAdd }}</text>
          <text v-if="item.balance != null">
            {{ card?.type === 0 ? `剩余 ${item.balance} 次` : `余额 ¥${item.balance}` }}
          </text>
        </view>
      </view>

      <view v-if="failed" class="record-state">
        <view>明细加载失败</view>
        <button class="record-button" @tap="vm.retry()">
          重试
        </button>
      </view>
      <button v-else-if="hasMore" class="record-button" :disabled="loading" @tap="vm.loadMore()">
        {{ loading ? '加载中…' : '加载更多明细' }}
      </button>
      <view v-else-if="loaded && !loading && list.length" class="record-state">
        已经到底了
      </view>
    </template>
  </view>
</template>

<style scoped>
.detail-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
  background: #eaded2;
  border-radius: 20rpx;
}

.detail-tab {
  width: 100%;
  min-height: 80rpx;
  margin: 0;
  font-size: 26rpx;
  line-height: 1.4;
  color: #604737;
  background: transparent;
  border-radius: 14rpx;
}

.detail-tab::after {
  border: 0;
}

.detail-tab-selected {
  font-weight: 600;
  color: #4f3528;
  background: #fff;
}

.detail-page {
  box-sizing: border-box;
  width: 100%;
  min-height: calc(100vh - var(--window-top, 0px) - var(--window-bottom, 0px));
  padding: 24rpx 24rpx calc(32rpx + env(safe-area-inset-bottom));
  color: #3d2f26;
  background: #f5f0eb;
}

.card-summary {
  padding: 28rpx;
  color: #fff;
  background: linear-gradient(135deg, #8c6045, #63432f);
  border-radius: 20rpx;
}

.record-row {
  padding: 24rpx;
  margin-bottom: 16rpx;
  background: #fff;
  border-radius: 16rpx;
}

.record-state {
  padding: 32rpx 16rpx;
  color: #665d56;
  font-size: 26rpx;
  text-align: center;
}

.record-button {
  margin-top: 16rpx;
  color: #63432f;
  font-size: 28rpx;
}
</style>
