<script setup lang="ts">
import { t } from '@/locale'
import { useLanguage } from './composables/useLanguage'

const { selectedLanguage, openLanguagePicker, showLangSheet, langOptions, selectLang } = useLanguage()
</script>

<template>
  <!-- 语言切换触发入口按钮 -->
  <button class="language-button" @tap="openLanguagePicker">
    <image class="language-icon" :src="selectedLanguage.icon" mode="aspectFit" />
    <text>{{ t('common.selectLang') }} · {{ selectedLanguage.label }}</text>
  </button>

  <!-- 底部语言选择弹出层 (Popup) -->
  <wd-popup v-model="showLangSheet" position="bottom" :z-index="1000" root-portal round>
    <view class="lang-picker__sheet">
      <!-- 弹窗标题 -->
      <view class="lang-picker__title">
        {{ t('common.selectLang') }}
      </view>

      <!-- 可选语言列表：高亮当前选中项并展示勾选图标 -->
      <view
        v-for="opt in langOptions"
        :key="opt.code"
        class="lang-picker__item"
        :class="{ 'lang-picker__item--active': opt.active }"
        @tap="selectLang(opt.code)"
      >
        <text>{{ opt.label }}</text>
        <wd-icon v-if="opt.active" name="check" size="18px" color="#018d71" />
      </view>

      <!-- 底部取消按钮 -->
      <view class="lang-picker__cancel" @tap="showLangSheet = false">
        {{ t('common.cancel') }}
      </view>
    </view>
  </wd-popup>
</template>

<style scoped>
.language-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin: 0;
  padding: 12rpx 24rpx;
  color: #018d71;
  background: #f0faf6;
  font-size: 28rpx;
}
.language-icon {
  width: 40rpx;
  height: 40rpx;
}
.lang-picker__sheet {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}
.lang-picker__title {
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  color: #999;
  font-size: 26rpx;
  text-align: center;
}
.lang-picker__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96rpx;
  border-bottom: 1rpx solid #f0f0f0;
  color: #333;
  font-size: 30rpx;
}
.lang-picker__item--active {
  color: #018d71;
  font-weight: 600;
}
.lang-picker__cancel {
  height: 96rpx;
  margin-top: 16rpx;
  border-radius: 16rpx;
  background: #f7f7f7;
  color: #999;
  font-size: 30rpx;
  line-height: 96rpx;
  text-align: center;
}
</style>
