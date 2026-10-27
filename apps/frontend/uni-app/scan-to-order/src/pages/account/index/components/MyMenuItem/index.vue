<script setup lang="ts">
defineOptions({ name: 'MyMenuItem' })
/**
 * 我的-列表菜单项（纯展示）
 */
defineProps<{
  icon: string
  text: string
  /** 图标背景渐变起止色与图标色 */
  from: string
  to: string
  color: string
}>()

const emit = defineEmits<{
  select: []
}>()
</script>

<template>
  <view class="menu-list-item" @tap="emit('select')">
    <view class="flex flex-1 items-center">
      <view class="list-icon" :style="{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`, color }">
        <wd-icon :name="icon" size="20px" :color="color" />
      </view>
      <text class="text-28rpx text-#333 font-500">
        {{ text }}
      </text>
    </view>
    <view class="menu-chevron" />
  </view>
</template>

<style lang="scss" scoped>
.menu-chevron {
  width: 14rpx;
  height: 14rpx;
  margin-right: 6rpx;
  border-top: 3rpx solid #999;
  border-right: 3rpx solid #999;
  transform: rotate(45deg);
}

.menu-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 28rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:active {
    background: #fafafa;
  }
}

.list-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  margin-right: 24rpx;
  border-radius: 50%;
}
</style>
