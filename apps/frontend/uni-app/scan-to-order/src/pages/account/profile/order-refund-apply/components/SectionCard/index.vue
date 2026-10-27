<script setup lang="ts">
defineOptions({ name: 'SectionCard' })
/**
 * 售后页通用分区卡片：左侧色条标题 + 可选提示 + 内容插槽
 */
withDefaults(defineProps<{
  title: string
  tip?: string
}>(), {
  tip: '',
})
</script>

<template>
  <view class="section-card">
    <view class="section-title">
      <view class="title-line" />
      <text class="title-text">
        {{ title }}
      </text>
      <text v-if="tip" class="title-tip">
        {{ tip }}
      </text>
    </view>
    <slot />
  </view>
</template>

<style lang="scss" scoped>
.section-card {
  margin: 0 24rpx 24rpx;
  overflow: hidden;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(139, 111, 71, 0.08);
}

.section-title {
  display: flex;
  align-items: center;
  padding: 32rpx 32rpx 24rpx;
}

.title-line {
  width: 6rpx;
  height: 32rpx;
  margin-right: 16rpx;
  background: linear-gradient(180deg, #e8b899 0%, #cf8e63 100%);
  border-radius: 3rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #5a4a3a;
  letter-spacing: 0.5rpx;
}

.title-tip {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: #b8977d;
}
</style>
