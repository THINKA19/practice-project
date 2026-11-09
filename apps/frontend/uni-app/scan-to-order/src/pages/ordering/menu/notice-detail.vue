<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】菜单选品 / notice-detail.vue
 * 页面入口：组装页面状态、生命周期与展示组件，页面仅由路由加载。
 * 【方法与导出清单】
 * - 路由页面。
 * 【综合使用示例】
 * import { ClientRoutes } from '@/pages/routes'
 * // 由页面路由加载 menu/notice-detail.vue；页面不作为组件 import。
 * ============================================================================
 */
import { PageState } from '@/components/page-state'
import { useOrderingNoticeDetailPage } from './composables/use-notice-detail-page'

definePage({ style: { navigationBarTitleText: '消息详情' } })
const { message, loading, error, init, load } = useOrderingNoticeDetailPage()
onLoad((query) => {
  void init(query as { id?: string })
})
</script>

<template>
  <view class="message-page">
    <PageState v-if="loading" status="loading" title="正在加载消息" />
    <PageState v-else-if="error" status="error" title="消息加载失败" :description="error">
      <button size="mini" @tap="load">
        重新加载
      </button>
    </PageState>
    <view v-else-if="message" class="message-card">
      <text class="message-title">{{ message.title }}</text>
      <text v-if="message.publishedAt" class="message-date">{{ message.publishedAt }}</text>
      <text class="message-content">{{ message.content }}</text>
    </view>
    <PageState v-else status="empty" title="这条消息不存在或已下线" />
  </view>
</template>

<style lang="scss" scoped>
.message-page {
  box-sizing: border-box;
  min-height: calc(100vh - var(--window-top, 0px));
  padding: 32rpx 24rpx;
  background: #faf7f2;
}
.message-card {
  padding: 40rpx 32rpx;
  background: #fff;
  border-radius: 24rpx;
}
.message-title {
  display: block;
  font-size: 38rpx;
  font-weight: 600;
  line-height: 1.5;
  color: #39291e;
}
.message-date {
  display: block;
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #999;
}
.message-content {
  display: block;
  margin-top: 36rpx;
  font-size: 30rpx;
  line-height: 1.9;
  color: #54473d;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
