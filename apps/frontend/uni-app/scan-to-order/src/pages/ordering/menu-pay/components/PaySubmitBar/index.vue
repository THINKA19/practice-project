<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】结算与支付 / components/PaySubmitBar/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import PaySubmitBar from '@/pages/ordering/menu-pay/components/PaySubmitBar/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
withDefaults(defineProps<{
  amount: number
  hint?: string
  notice?: string
  label: string
  buttonText: string
  disabled?: boolean
  loading?: boolean
}>(), {
  disabled: false,
  loading: false,
})

const emit = defineEmits<{ submit: [] }>()

const { countryCode } = useOrderingCurrency()

/**
 * 结算页 - 底部提交栏（原 van-submit-bar，纯展示）
 */
</script>

<template>
  <view class="submit-bar">
    <view v-if="notice" class="settlement-notice">
      {{ notice }}
    </view>
    <view class="submit-main">
      <view class="min-w-0 flex flex-1 flex-col items-end pr-24rpx">
        <view class="flex items-baseline">
          <text class="shrink-0 text-28rpx text-#333">
            {{ label }}：
          </text>
          <text class="text-40rpx text-#c93636 font-semibold"><FgPrice :amount="amount" :country-code="countryCode" show-currency-name /></text>
        </view>
        <text v-if="hint" class="text-22rpx text-#999">{{ hint }}</text>
      </view>
      <wd-button
        custom-class="pay-btn"
        round
        :disabled="disabled || loading"
        @click="emit('submit')"
      >
        <PageLoading v-if="loading" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
        {{ buttonText }}
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.submit-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  box-sizing: content-box;
}
.submit-main {
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 32rpx;
}
.settlement-notice {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  line-height: 32rpx;
  color: #8b7355;
  text-align: center;
  background: #fff8f0;
}

:deep(.pay-btn) {
  min-width: 220rpx;
  font-size: 32rpx !important;
  font-weight: 600 !important;
  background: var(--app-brand-primary, #8b4513) !important;
  border: none !important;
  box-shadow: 0 4rpx 12rpx rgb(139 69 19 / 16%);
}

:deep(.pay-btn.is-disabled) {
  color: #6f6258 !important;
  background: #e9e3dc !important;
  opacity: 1;
  box-shadow: none;
}
</style>
