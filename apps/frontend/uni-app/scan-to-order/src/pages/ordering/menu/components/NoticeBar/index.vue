<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】菜单选品 / components/NoticeBar/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import NoticeBar from '@/pages/ordering/menu/components/NoticeBar/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import type { OrderingNotice } from '../../models/types'
import { ref } from 'vue'

const props = defineProps<{ notices: OrderingNotice[] }>()
const emit = defineEmits<{ open: [notice: OrderingNotice] }>()
const current = ref(0)

function openCurrent() {
  const notice = props.notices[current.value] || props.notices[0]
  if (notice)
    emit('open', notice)
}
</script>

<template>
  <view class="notice">
    <wd-icon name="sound" size="32rpx" color="#aa7848" />
    <swiper class="notice-swiper" vertical :autoplay="notices.length > 1" :circular="notices.length > 1" :interval="3500" :duration="450" @change="current = $event.detail.current">
      <swiper-item v-for="item in notices" :key="item.id">
        <view class="notice-item" role="button" @tap="emit('open', item)">
          <text class="notice-title">{{ item.title }}</text>
        </view>
      </swiper-item>
    </swiper>
    <view v-if="notices.length" class="notice-more" role="button" aria-label="查看当前公告" @tap="openCurrent">
      <view class="notice-chevron" aria-hidden="true" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.notice {
  display: flex;
  flex-shrink: 0;
  gap: 16rpx;
  align-items: center;
  padding: 0 24rpx;
  margin: 16rpx 24rpx 0;
  overflow: hidden;
  color: #aa7848;
  background: #fff8f0;
  border: 1rpx solid #f1e3d2;
  border-radius: 16rpx;
}
.notice-swiper {
  flex: 1;
  min-width: 0;
  height: 76rpx;
}
.notice-item {
  display: flex;
  gap: 12rpx;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}
.notice-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 26rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.notice-chevron {
  flex-shrink: 0;
  width: 12rpx;
  height: 12rpx;
  margin-right: 4rpx;
  border-top: 2rpx solid currentColor;
  border-right: 2rpx solid currentColor;
  transform: rotate(45deg);
}
.notice-more {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 44rpx;
  height: 76rpx;
}
</style>
