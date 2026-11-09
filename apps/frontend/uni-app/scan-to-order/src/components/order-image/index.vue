<script setup lang="ts">
import { ref, watch } from 'vue'

defineOptions({ name: 'OrderImage' })

const props = withDefaults(defineProps<{ src?: string, label?: string }>(), { src: '', label: '暂无图片' })
const failed = ref(false)
const loaded = ref(false)
watch(() => props.src, () => {
  failed.value = false
  loaded.value = false
})
</script>

<template>
  <view class="order-image">
    <view v-if="!src || failed || !loaded" class="image-placeholder">
      <text>{{ src && !failed ? '图片加载中' : label }}</text>
    </view>
    <image v-if="src && !failed" :key="src" :src="src" mode="aspectFill" class="image-content" @load="loaded = true" @error="failed = true" />
  </view>
</template>

<style scoped>
.order-image {
  position: relative;
  overflow: hidden;
  background: #f3ebe2;
  border-radius: 16rpx;
}
.image-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
  color: #91775e;
  font-size: 22rpx;
  text-align: center;
}
.image-content {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
