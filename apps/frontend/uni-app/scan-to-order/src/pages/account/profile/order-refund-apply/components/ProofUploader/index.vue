<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'ProofUploader' })
/**
 * 售后凭证图片选择（纯展示：选择/删除/预览通过 emit 交给 ViewModel）
 */
const props = withDefaults(defineProps<{
  files: string[]
  max?: number
  uploadText?: string
}>(), {
  max: 9,
  uploadText: '',
})

const emit = defineEmits<{
  choose: []
  remove: [index: number]
  preview: [index: number]
}>()

const canAdd = computed(() => props.files.length < props.max)
</script>

<template>
  <view class="upload-box">
    <view v-for="(f, idx) in files" :key="f" class="upload-item">
      <image :src="f" mode="aspectFill" class="upload-img" @tap="emit('preview', idx)" />
      <view class="upload-del" @tap.stop="emit('remove', idx)">
        <wd-icon name="close" size="12px" color="#fff" />
      </view>
    </view>
    <view v-if="canAdd" class="upload-item upload-add" @tap="emit('choose')">
      <wd-icon name="camera" size="24px" color="#CF8E63" />
      <text v-if="uploadText" class="upload-text">
        {{ uploadText }}
      </text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.upload-box {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 24rpx 32rpx 32rpx;
}

.upload-item {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  overflow: hidden;
  border-radius: 16rpx;
}

.upload-img {
  width: 100%;
  height: 100%;
}

.upload-del {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.5);
  border-bottom-left-radius: 16rpx;
}

.upload-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff9f5;
  border: 2rpx dashed #e0d3c5;
  box-sizing: border-box;
}

.upload-text {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #b8977d;
}
</style>
