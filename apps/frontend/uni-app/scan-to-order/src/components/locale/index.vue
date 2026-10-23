<!--
============================================================================
【文件概述】统一语言选择组件，支持文字入口和仅图标入口，复用同一语言弹层。
【方法与导出清单】默认组件；iconOnly 为 true 时隐藏入口文字，默认 false。
【综合使用示例】
import LocalePicker from '@/components/locale/index.vue'
// 模板：<LocalePicker icon-only />，仅展示当前语言图标。
============================================================================
-->
<script setup lang="ts">
import { t } from '@/locale'
import { useLanguage } from './composables/useLanguage'

withDefaults(defineProps<{
  /** 是否只显示触发图标；弹层内仍显示语言名称供选择。 */
  iconOnly?: boolean
}>(), { iconOnly: false })

const { selectedLanguage, openLanguagePicker, showLangSheet, langOptions, selectLang } = useLanguage()
</script>

<template>
  <!-- 语言切换触发入口按钮 -->
  <button class="language-button" :class="{ 'language-button--icon-only': iconOnly }" :aria-label="t('common.selectLang')" @tap="openLanguagePicker">
    <image class="language-icon" :src="selectedLanguage.icon" mode="aspectFit" />
    <text v-if="!iconOnly">{{ t('common.selectLang') }} · {{ selectedLanguage.label }}</text>
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
.language-button--icon-only {
  flex-shrink: 0;
  width: 56rpx;
  height: 56rpx;
  padding: 0;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2rpx 12rpx rgb(0 0 0 / 6%);
}
.language-button--icon-only::after {
  border: none;
}
.language-button--icon-only .language-icon {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
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
