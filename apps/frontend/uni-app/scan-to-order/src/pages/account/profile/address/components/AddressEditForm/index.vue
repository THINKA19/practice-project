<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import { ref } from 'vue'
import { PhoneInput } from '@/components/phone-input'
import type { PhoneInputHandle } from '@/components/phone-input'
import { useI18n } from 'vue-i18n'
import { useForm } from './use-address-edit-form'
import type { FormProps } from './types'

defineOptions({ name: 'AddressEditForm' })

const props = defineProps<FormProps>()
const emit = defineEmits<{
  input: [field: 'linkMan' | 'mobile' | 'address' | 'phoneCountry' | 'countryCode' | 'regionText', value: string]
  save: []
  cancel: []
  locate: []
}>()
const { t } = useI18n()
const { sheet, countryName, options, choose } = useForm(props, emit)
const phoneField = ref<PhoneInputHandle>()
function save() {
  if (phoneField.value?.validate())
    emit('save')
}
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
        <text class="label phone-label"><text class="required">*</text>{{ t('account.profile.address.mobile') }}</text>
        <view class="min-w-0 flex-1">
          <phone-input ref="phoneField" :model-value="draft.mobile" :country="draft.phoneCountry" :disabled="saving" required @update:model-value="emit('input', 'mobile', $event)" @update:country="emit('input', 'phoneCountry', $event)" />
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
    <button class="location-btn" :disabled="saving || locating" @tap="emit('locate')">
      <PageLoading v-if="locating" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
      {{ draft.latitude != null && draft.longitude != null ? '重新选择地图位置' : '补充地图定位（选填）' }}
    </button>
    <view v-if="draft.latitude != null && draft.longitude != null" class="text-24rpx text-#666">
      已保存地址定位
    </view>
    <button class="save-btn" :disabled="saving || locating" @tap="save">
      <PageLoading v-if="saving" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
      {{ t('account.profile.address.save') }}
    </button>
    <button class="cancel-btn" :disabled="saving" @tap="emit('cancel')">
      {{ t('common.cancel') }}
    </button>
    <wd-popup :model-value="!!sheet" position="bottom" round closable safe-area-inset-bottom custom-style="background-color: #FFFFFF;" @close="sheet = ''">
      <view class="country-sheet">
        <view class="mb-24rpx text-center text-32rpx font-600">
          {{ sheet === 'area' ? '选择所在地区' : '选择配送国家' }}
        </view>
        <view v-for="country in options" :key="country.code" class="sheet-option" @tap="choose(country.code)">
          <text>{{ country.name }}</text>
          <wd-icon v-if="country.code === (sheet === 'area' ? draft.regionText : draft.countryCode)" name="check" color="#ea8d79" />
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
.label.phone-label {
  width: 112rpx;
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
.location-btn,
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
.location-btn {
  font-size: 26rpx;
  color: #8b4513;
  background: #fff;
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
