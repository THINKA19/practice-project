<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useForm } from './use-address-edit-form'
import type { FormProps } from './types'

defineOptions({ name: 'AddressEditForm' })

const props = defineProps<FormProps>()
const emit = defineEmits<{
  input: [field: 'linkMan' | 'mobile' | 'address' | 'phoneCountry' | 'countryCode' | 'regionText', value: string]
  save: []
  cancel: []
}>()
const { t } = useI18n()
const { sheet, phoneValue, phoneEditing, phoneError, inputPhone, blurPhone, save, phoneCountry, countryName, options, choose } = useForm(props, emit)
</script>

<template>
  <view class="address-edit">
    <view class="required-hint">
      <text class="required">*</text><text>为必填项</text>
    </view>
    <view class="form-panel">
      <view class="row-wrap">
        <text class="label"><text class="required">*</text>{{ t('account.profile.address.linkMan') }}</text>
        <input class="field" :disabled="saving" :value="draft.linkMan" :placeholder="t('account.profile.address.linkManPlaceholder')" @input="emit('input', 'linkMan', $event.detail.value)">
      </view>
      <view class="row-wrap">
        <text class="label"><text class="required">*</text>{{ t('account.profile.address.mobile') }}</text>
        <view class="phone-input-group min-w-0 flex-1">
          <view class="phone-fields">
            <view class="country-picker phone-prefix" role="button" aria-label="选择手机国家区号" @tap="!saving && (sheet = 'phone')">
              <view class="phone-country-value">
                {{ phoneCountry.name }} +{{ phoneCountry.dial }}
              </view>
              <text class="phone-switch">切换</text>
            </view>
            <input class="field" type="text" :disabled="saving" :value="phoneValue" :maxlength="22" placeholder="请输入手机号" :aria-invalid="phoneError" @focus="phoneEditing = true" @blur="blurPhone" @input="inputPhone($event.detail.value)">
          </view>
          <view v-if="phoneError" class="phone-error" role="alert">
            {{ t(phoneValue.trim() ? 'account.profile.address.mobileInvalid' : 'account.profile.address.mobilePlaceholder') }}
          </view>
        </view>
      </view>
      <view class="row-wrap">
        <text class="label"><text class="required">*</text>配送国家</text>
        <view class="field country-picker" @tap="!saving && (sheet = 'region')">
          {{ countryName || '请选择配送国家' }} <view class="selection-chevron" aria-hidden="true" />
        </view>
      </view>
      <view class="row-wrap">
        <text class="label"><text class="required">*</text>所在地区</text>
        <view class="field country-picker" :class="{ 'field-disabled': !draft.countryCode }" @tap="!saving && draft.countryCode && (sheet = 'area')">
          {{ draft.regionText || (draft.countryCode ? '请选择省／城市' : '请先选择配送国家') }} <view class="selection-chevron" aria-hidden="true" />
        </view>
      </view>
      <view class="row-wrap row-textarea">
        <text class="label"><text class="required">*</text>{{ t('account.profile.address.address') }}</text>
        <textarea class="field detail-input" :disabled="saving" :value="draft.address" :placeholder="t('account.profile.address.addressPlaceholder')" auto-height :maxlength="300" @input="emit('input', 'address', $event.detail.value)" />
      </view>
    </view>
    <button class="save-btn" :loading="saving" :disabled="saving" @tap="save">
      {{ t('account.profile.address.save') }}
    </button>
    <button class="cancel-btn" :disabled="saving" @tap="emit('cancel')">
      {{ t('common.cancel') }}
    </button>
    <wd-popup :model-value="!!sheet" position="bottom" round closable safe-area-inset-bottom custom-style="background-color: #FFFFFF;" @close="sheet = ''">
      <view class="country-sheet">
        <view class="mb-24rpx text-center text-32rpx font-600">
          {{ sheet === 'phone' ? '选择手机区号' : sheet === 'area' ? '选择所在地区' : '选择配送国家' }}
        </view>
        <view v-for="country in options" :key="country.code" class="sheet-option" @tap="choose(country.code)">
          <text>{{ country.name }}</text>
          <wd-icon v-if="country.code === (sheet === 'phone' ? draft.phoneCountry : sheet === 'area' ? draft.regionText : draft.countryCode)" name="check" color="#ea8d79" />
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<style scoped>
.address-edit {
  background: #f5f6f8;
  flex: 1;
  box-sizing: border-box;
  width: 100%;
  padding: 32rpx 24rpx calc(48rpx + env(safe-area-inset-bottom));
}
.row-wrap {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: 100%;
  padding: 28rpx 24rpx;
  background: #ffffff;
  border-bottom: 1px solid #f3f0ee;
}
.form-panel {
  overflow: hidden;
  background: #ffffff;
  border-radius: 24rpx;
}
.form-panel .row-wrap:last-child {
  border-bottom: 0;
}
.phone-fields {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.phone-error {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 36rpx;
  color: #d84a45;
}
.phone-prefix {
  flex-shrink: 0;
  gap: 6rpx;
  border-right: 1px solid #c9c9c9;
  flex-direction: column;
  align-items: flex-start;
  padding: 8rpx 16rpx 8rpx 0;
}
.field.field-disabled {
  color: #bbb;
}
.required-hint {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8rpx;
  margin-bottom: 24rpx;
  font-size: 24rpx;
  line-height: 36rpx;
  color: #777;
}
.phone-country-value {
  font-size: 24rpx;
  line-height: 34rpx;
}
.phone-switch {
  font-size: 22rpx;
  line-height: 30rpx;
  color: #c96f60;
}
.label {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 136rpx;
  font-size: 28rpx;
  line-height: 44rpx;
  color: #555;
}
.required {
  transform: translateY(4rpx);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: center;
  width: 16rpx;
  margin-right: 8rpx;
  line-height: inherit;
  color: #d84a45;
}
.field {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  width: 100%;
  background-color: #ffffff;
  padding: 0;
  font-size: 26rpx;
  line-height: 44rpx;
  color: #555;
}
.selection-chevron {
  color: #999999;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 14rpx;
  height: 14rpx;
  margin-right: 4rpx;
  border-top: 2rpx solid currentColor;
  border-right: 2rpx solid currentColor;
  transform: rotate(45deg);
}
.country-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44rpx;
  font-size: 26rpx;
  color: #555;
}
.row-textarea {
  align-items: flex-start;
}
.detail-input {
  min-height: 100rpx;
  padding-top: 0;
}
.save-btn,
.cancel-btn {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  margin-top: 24rpx;
  font-size: 30rpx;
  border-radius: 48rpx;
}
.save-btn {
  color: #ffffff;
  background: linear-gradient(110deg, #ff9d7e, #e98775);
}
.cancel-btn {
  color: #555;
  background: #ffffff;
  border: 1px solid #d8dce3;
  border-radius: 48rpx;
}
.cancel-btn::after {
  border: 0;
}
.country-sheet {
  max-height: 65vh;
  overflow-y: auto;
  padding: 40rpx 32rpx;
  background: #ffffff;
  color: #555;
}
.sheet-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 20rpx;
  font-size: 30rpx;
  background: #ffffff;
  border-bottom: 1px solid #ededed;
}
</style>
