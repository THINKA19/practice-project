<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProfileEditor } from './use-profile-editor'

defineOptions({ name: 'ProfileEditorPanel' })

const vm = useProfileEditor()
const { visible, form, loading, saving, ready, error, logoutConfirmVisible, logoutPending } = vm
const genderVisible = ref(false)
const birthdayVisible = ref(false)
const today = new Date()
const years = Array.from({ length: today.getFullYear() - 1900 + 1 }, (_, index) => 1900 + index)
const birthdayDraft = ref([2000 - 1900, 0, 0])
const selectedYear = computed(() => years[birthdayDraft.value[0]])
const months = computed(() => Array.from({ length: selectedYear.value === today.getFullYear() ? today.getMonth() + 1 : 12 }, (_, index) => index + 1))
const days = computed(() => {
  const month = months.value[birthdayDraft.value[1]] ?? 1
  const limit = selectedYear.value === today.getFullYear() && month === today.getMonth() + 1 ? today.getDate() : new Date(selectedYear.value, month, 0).getDate()
  return Array.from({ length: limit }, (_, index) => index + 1)
})
watch(visible, (value) => {
  if (!value) {
    birthdayVisible.value = false
    genderVisible.value = false
  }
})
function openBirthday() {
  if (!ready.value || saving.value)
    return
  const date = form.birthday ? new Date(`${form.birthday}T00:00:00`) : new Date(2000, 0, 1)
  birthdayDraft.value = [date.getFullYear() - 1900, date.getMonth(), date.getDate() - 1]
  birthdayVisible.value = true
}
function changeBirthday(event: { detail: { value: number[] } }) {
  const [year, month, day] = event.detail.value
  const nextYear = Math.max(0, Math.min(year, years.length - 1))
  const monthLimit = years[nextYear] === today.getFullYear() ? today.getMonth() : 11
  const nextMonth = Math.max(0, Math.min(month, monthLimit))
  const dayLimit = years[nextYear] === today.getFullYear() && nextMonth === today.getMonth() ? today.getDate() : new Date(years[nextYear], nextMonth + 1, 0).getDate()
  birthdayDraft.value = [nextYear, nextMonth, Math.max(0, Math.min(day, dayLimit - 1))]
}
function confirmBirthday() {
  if (!visible.value || !ready.value)
    return
  const [year, month, day] = birthdayDraft.value
  form.birthday = `${years[year]}-${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`
  birthdayVisible.value = false
}
function selectGender(gender: 'male' | 'female') {
  form.gender = gender
  genderVisible.value = false
}
defineExpose({ open: vm.open })
</script>

<template>
  <wd-popup v-model="visible" position="bottom" root-portal :z-index="1000" closable :close-on-click-modal="!saving" custom-style="border-radius: 28rpx 28rpx 0 0;">
    <view class="profile-sheet pb-safe">
      <view class="sheet-title">
        个人资料
      </view>
      <view class="profile-fields" :class="{ 'is-loading': !ready }" :aria-busy="loading">
        <button class="profile-row" :disabled="!ready || saving" @tap="genderVisible = true">
          <text>性别（选填）</text><text class="row-value">{{ form.gender === 'male' ? '男' : form.gender === 'female' ? '女' : '请选择' }} ›</text>
        </button>
        <button class="profile-row birthday-row" :disabled="!ready || saving" @tap="openBirthday">
          <text>生日（选填）</text><text class="row-value">{{ form.birthday || '请选择' }} ›</text>
        </button>
        <button class="clear-birthday" :class="{ 'clear-birthday--hidden': !form.birthday }" :disabled="!ready || saving || !form.birthday" @tap="form.birthday = ''">
          清空生日
        </button>
        <button class="panel-button save-button" :loading="saving" :disabled="!ready || saving" @tap="vm.save">
          保存
        </button>
      </view>
      <view v-if="error" role="alert" class="error-text">
        {{ error }}
      </view>
      <button class="panel-button logout-button" :disabled="saving || logoutPending" @tap="vm.logout">
        退出登录
      </button>
    </view>
  </wd-popup>
  <wd-popup v-model="logoutConfirmVisible" position="center" root-portal :z-index="3000" :close-on-click-modal="false" round>
    <view class="logout-confirm" role="dialog" aria-modal="true" aria-label="退出登录">
      <view class="sheet-title">
        退出登录
      </view>
      <view class="logout-confirm__message">
        确定退出当前账号吗？
      </view>
      <view class="logout-confirm__actions">
        <button class="logout-cancel" :disabled="logoutPending" @tap="logoutConfirmVisible = false">
          取消
        </button>
        <button class="logout-confirm-button" :disabled="logoutPending" :loading="logoutPending" @tap="vm.confirmLogout">
          确定
        </button>
      </view>
    </view>
  </wd-popup>
  <wd-popup v-model="genderVisible" position="bottom" root-portal :z-index="2000" round>
    <view class="selection-sheet pb-safe">
      <view class="sheet-title">
        选择性别
      </view>
      <button class="selection-option" @tap="selectGender('male')">
        男<text v-if="form.gender === 'male'"> ✓</text>
      </button>
      <button class="selection-option" @tap="selectGender('female')">
        女<text v-if="form.gender === 'female'"> ✓</text>
      </button>
      <button class="selection-cancel" @tap="genderVisible = false">
        取消
      </button>
    </view>
  </wd-popup>
  <wd-popup v-model="birthdayVisible" position="bottom" root-portal :z-index="2000" round>
    <view class="selection-sheet pb-safe">
      <view class="picker-toolbar">
        <button class="picker-action" @tap="birthdayVisible = false">
          取消
        </button>
        <text class="picker-title">选择生日</text>
        <button class="picker-action picker-confirm" @tap="confirmBirthday">
          确定
        </button>
      </view>
      <picker-view v-if="birthdayVisible" class="birthday-picker" :value="birthdayDraft" indicator-style="height: 52px;" @change="changeBirthday">
        <picker-view-column>
          <view v-for="year in years" :key="year" class="picker-item">
            {{ year }}年
          </view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="month in months" :key="month" class="picker-item">
            {{ month }}月
          </view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="day in days" :key="day" class="picker-item">
            {{ day }}日
          </view>
        </picker-view-column>
      </picker-view>
    </view>
  </wd-popup>
</template>

<style scoped>
.profile-sheet,
.selection-sheet {
  padding: 32rpx;
}
.sheet-title {
  padding: 8rpx 0 32rpx;
  text-align: center;
  color: #333;
  font-size: 34rpx;
  font-weight: 600;
}
.profile-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 116rpx;
  padding: 20rpx 0;
  margin: 0;
  color: #333;
  font-size: 30rpx;
  line-height: 1.5;
  text-align: left;
  background: #fff;
  border-bottom: 1rpx solid #eee;
  border-radius: 0;
}
.row-value {
  color: #666;
}
button::after {
  border: none;
}
.panel-button {
  margin-top: 28rpx;
  padding: 12rpx;
  font-size: 30rpx;
  border-radius: 16rpx;
}
.save-button {
  color: #fff;
  background: #07c160;
}
.logout-button {
  color: #666;
  background: #f2f3f5;
}
.clear-birthday {
  padding: 16rpx 0;
  margin: 0;
  text-align: right;
  font-size: 26rpx;
  color: #777;
  background: #fff;
}
.is-loading .row-value {
  color: transparent;
  background: #f2f3f5;
  border-radius: 8rpx;
  min-width: 120rpx;
}
.clear-birthday--hidden {
  visibility: hidden;
  pointer-events: none;
}
.logout-confirm {
  width: 600rpx;
  max-width: 86vw;
  padding: 36rpx 32rpx 0;
  box-sizing: border-box;
  background: #fff;
}
.logout-confirm__message {
  text-align: center;
  color: #666;
  font-size: 30rpx;
  padding-bottom: 40rpx;
}
.logout-confirm__actions {
  display: flex;
  border-top: 1rpx solid #eee;
}
.logout-cancel,
.logout-confirm-button {
  flex: 1;
  padding: 24rpx 0;
  margin: 0;
  background: #fff;
  font-size: 30rpx;
}
.logout-cancel {
  color: #666;
}
.logout-confirm-button {
  color: #07a957;
  border-left: 1rpx solid #eee;
  border-radius: 0;
}
.error-text {
  padding-top: 24rpx;
  color: #d93025;
  font-size: 28rpx;
}
.selection-option,
.selection-cancel {
  width: 100%;
  padding: 24rpx;
  margin: 0;
  font-size: 32rpx;
  line-height: 1.5;
  color: #333;
  background: #fff;
  border-radius: 0;
  border-bottom: 1rpx solid #eee;
}
.selection-cancel {
  margin-top: 20rpx;
  color: #777;
  background: #f6f6f6;
  border: 0;
}
.picker-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100rpx;
  border-bottom: 1rpx solid #eee;
}
.picker-title {
  color: #333;
  font-size: 32rpx;
  font-weight: 600;
}
.picker-action {
  padding: 20rpx 12rpx;
  margin: 0;
  color: #777;
  font-size: 30rpx;
  line-height: 1.5;
  background: transparent;
}
.picker-confirm {
  color: #07a957;
}
.birthday-picker {
  width: 100%;
  height: 280px;
}
.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  font-size: 34rpx;
  color: #333;
}
</style>
