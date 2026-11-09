<script setup lang="ts">
import { usePhoneInput } from './use-phone-input'
import type { PhoneInputEmits, PhoneInputProps } from './types'

defineOptions({ name: 'PhoneInput' })
const props = withDefaults(defineProps<PhoneInputProps>(), {
  country: 'VN',
  required: false,
  disabled: false,
  placeholder: '请输入手机号',
})
const emit = defineEmits<PhoneInputEmits>()
const {
  value,
  open,
  countryLabel,
  errorMessage,
  inputPhone,
  focus,
  blur,
  clear,
  openPicker,
  closePicker,
  choose,
  validate,
  countries,
} = usePhoneInput(props, emit)
defineExpose({ validate })
</script>

<template>
  <view class="phone-input">
    <view class="phone-fields">
      <view
        class="country-picker phone-prefix"
        role="button"
        aria-label="选择手机国家区号"
        :aria-disabled="disabled"
        @tap="openPicker"
      >
        <text class="phone-country-value">{{ countryLabel }}</text>
        <view class="phone-chevron" aria-hidden="true" />
      </view>
      <input
        class="phone-number"
        type="text"
        :value="value"
        :disabled="disabled"
        :maxlength="22"
        :placeholder="placeholder"
        :aria-invalid="!!errorMessage"
        @input="inputPhone($event.detail.value)"
        @focus="focus"
        @blur="blur($event.detail?.value)"
      >
      <view v-if="value && !disabled" class="phone-clear" role="button" aria-label="清空手机号" @tap="clear">
        清除
      </view>
    </view>
    <view v-if="errorMessage" class="phone-error" role="alert">
      {{ errorMessage }}
    </view>

    <wd-popup :model-value="open" position="bottom" round closable safe-area-inset-bottom @close="closePicker">
      <view class="country-sheet">
        <view class="mb-24rpx text-center text-32rpx font-600">
          选择手机区号
        </view>
        <view v-for="item in countries" :key="item.code" class="sheet-option" @tap="choose(item.code)">
          <text>{{ item.name }} +{{ item.dial }}</text>
          <wd-icon v-if="item.code === country" name="check" color="#8b4513" />
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<style scoped>
.phone-input {
  width: 100%;
  min-width: 0;
}
.phone-fields {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.phone-prefix {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  min-height: 60rpx;
  padding: 8rpx 16rpx 8rpx 0;
  border-right: 1px solid #e9ddd0;
}
.phone-chevron {
  width: 10rpx;
  height: 10rpx;
  margin: 0 4rpx 6rpx;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  transform: rotate(45deg);
}
.phone-country-value {
  font-size: 24rpx;
  line-height: 34rpx;
  color: #555;
  white-space: nowrap;
}
.phone-number {
  flex: 1;
  min-width: 0;
  width: 100%;
  font-size: 26rpx;
  line-height: 44rpx;
  color: #555;
}
.phone-error {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 36rpx;
  color: #d84a45;
}
.phone-clear {
  flex-shrink: 0;
  padding: 8rpx 0 8rpx 8rpx;
  font-size: 24rpx;
  color: var(--app-brand-primary, #8b4513);
}
.country-sheet {
  padding: 40rpx 32rpx;
  max-height: 65vh;
  overflow-y: auto;
  background: #fff;
  color: #555;
}
.sheet-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 20rpx;
  font-size: 30rpx;
  border-bottom: 1px solid #ededed;
}
</style>
