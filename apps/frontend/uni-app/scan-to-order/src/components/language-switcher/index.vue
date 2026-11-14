<!--
============================================================================
【文件概述】统一语言选择组件，支持文字入口和仅图标入口，复用同一语言弹层。
【方法与导出清单】默认组件；iconOnly 为 true 时隐藏入口文字，默认 false。
【综合使用示例】
import LanguageSwitcher from '@/components/language-switcher/index.vue'
// 模板：<LanguageSwitcher icon-only />，仅展示当前语言图标。
============================================================================
-->
<script setup lang="ts">
import { t } from '@/locale'
import { useLanguageSwitcherPicker } from './composables/use-picker'

withDefaults(defineProps<{
  /** 是否只显示触发图标；弹层内仍显示语言名称供选择。 */
  iconOnly?: boolean
}>(), { iconOnly: false })

const { selectedLanguage, openLanguagePicker, showLangSheet, langOptions, selectLang } = useLanguageSwitcherPicker()
const showScrollbar = [
  // #ifdef H5
  true,
  // #endif
].includes(true)
</script>

<template>
  <!-- 语言切换触发入口按钮 -->
  <button class="language-button" :class="{ 'language-button--icon-only': iconOnly }" :aria-label="t('common.selectLang')" @tap="openLanguagePicker">
    <image class="language-icon" :src="selectedLanguage.icon" mode="aspectFit" />
    <text v-if="!iconOnly">{{ t('common.selectLang') }}</text>
  </button>

  <!-- 底部语言选择弹出层 (Popup) -->
  <wd-popup v-model="showLangSheet" position="bottom" :z-index="1000" root-portal round>
    <view class="lang-picker__sheet">
      <!-- 弹窗标题 -->
      <view class="lang-picker__title">
        {{ t('common.selectLang') }}
      </view>

      <!-- 可选语言列表：高亮当前选中项并展示勾选图标 -->
      <scroll-view
        scroll-y
        enhanced
        class="lang-picker__options"
        :show-scrollbar="showScrollbar"
      >
        <button
          v-for="opt in langOptions"
          :key="opt.code"
          class="lang-picker__item"
          :class="{ 'lang-picker__item--active': opt.active }"
          :aria-pressed="opt.active"
          @tap="selectLang(opt.code)"
        >
          <image class="lang-picker__flag" :src="opt.icon" mode="aspectFit" />
          <view class="lang-picker__labels">
            <text>{{ opt.label }}</text>
            <text class="lang-picker__country">{{ t(`market.${opt.country}`) }}</text>
          </view>
          <wd-icon v-if="opt.active" name="check" size="18px" color="#018d71" />
        </button>
      </scroll-view>

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
  gap: 8rpx;
  margin: 0;
  padding: 10rpx 14rpx;
  border-radius: 32rpx;
  color: #08755e;
  background: #f0faf6;
  font-size: 24rpx;
  line-height: 1.4;
}
.language-icon {
  flex-shrink: 0;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
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
.language-button::after {
  border: none;
}
.lang-picker__sheet {
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}
.lang-picker__title {
  padding-bottom: 8px;
  border-bottom: 1rpx solid #f0f0f0;
  color: #999;
  font-size: 26rpx;
  text-align: center;
}
.lang-picker__options {
  display: block;
  width: 100%;
  max-height: min(192px, 38vh);
}
/* #ifdef H5 */
.lang-picker__options :deep(.uni-scroll-view) {
  max-height: inherit;
  overscroll-behavior-y: contain;
}
@media (hover: hover) and (pointer: fine) {
  .lang-picker__options :deep(.uni-scroll-view) {
    scrollbar-color: #82918b #f0f4f2;
    scrollbar-width: auto;
  }
}
@media (hover: none), (pointer: coarse) {
  .lang-picker__options :deep(.uni-scroll-view) {
    scrollbar-width: none;
  }
  .lang-picker__options :deep(.uni-scroll-view::-webkit-scrollbar) {
    display: none;
  }
}
/* #endif */
.lang-picker__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  margin: 0;
  padding: 6px 8px;
  border-bottom: 1rpx solid #f0f0f0;
  border-radius: 0;
  background: #fff;
  color: #333;
  font-size: 14px;
  line-height: 1.4;
  text-align: left;
}
.lang-picker__item::after {
  border: none;
}
.lang-picker__flag {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
.lang-picker__labels {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4rpx 16rpx;
  min-width: 0;
}
.lang-picker__country {
  color: #666;
  font-size: 13px;
  font-weight: 400;
}
.lang-picker__item--active {
  background: #f0faf6;
  color: #018d71;
  font-weight: 600;
}
.lang-picker__cancel {
  height: 40px;
  margin-top: 8px;
  border-radius: 16rpx;
  background: #f7f7f7;
  color: #999;
  font-size: 14px;
  line-height: 40px;
  text-align: center;
}
</style>
