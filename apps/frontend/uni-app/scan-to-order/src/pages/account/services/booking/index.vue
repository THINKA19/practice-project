<script setup lang="ts">
/**
 * 预约订座：联系人、电话、到店时间、用餐人数
 */
import { useI18n } from 'vue-i18n'
import { useBookingForm } from './composables/use-form'

definePage({
  style: {
    navigationBarTitleText: '预约订座',
    disableScroll: true,
  },
})

const { t } = useI18n()
const vm = useBookingForm()
const { name, mobile, time, personIndex, personOptions, showDatetimePop, currentDate, minDate, configLoading, configFailed, submitting, pending } = vm

onLoad(() => {
  vm.init()
})

onShow(() => {
  vm.refresh()
})
</script>

<template>
  <z-paging fixed :use-page-scroll="false" :auto="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false" :paging-style="{ background: 'linear-gradient(180deg,#fff5e6 0%,#fff 100%)' }">
    <view class="booking-container">
      <view class="header-banner">
        <view class="banner-bg" />
        <view class="banner-content">
          <view class="banner-icon">
            🥤
          </view>
          <view class="mb-8rpx text-48rpx font-600 tracking-4rpx">
            {{ t('booking.title') }}
          </view>
          <view class="text-26rpx opacity-90">
            {{ t('booking.subtitle') }}
          </view>
        </view>
      </view>

      <view class="form-card">
        <view class="section-title">
          <view class="mr-12rpx text-40rpx">
            👤
          </view>
          <text class="title-text">
            {{ t('booking.infoTitle') }}
          </text>
        </view>
        <view class="input-group">
          <view class="input-label">
            <text class="label-text">
              {{ t('booking.name') }}
            </text>
            <text class="label-required">
              *
            </text>
          </view>
          <wd-input v-model="name" :placeholder="t('booking.namePlaceholder')" clearable focus custom-class="custom-field" />
        </view>
        <view class="input-group">
          <view class="input-label">
            <text class="label-text">
              {{ t('booking.mobile') }}
            </text>
            <text class="label-required">
              *
            </text>
          </view>
          <wd-input v-model="mobile" type="number" :placeholder="t('booking.mobilePlaceholder')" clearable custom-class="custom-field" />
        </view>
        <view class="input-group">
          <view class="input-label">
            <text class="label-text">
              {{ t('booking.time') }}
            </text>
            <text class="label-required">
              *
            </text>
          </view>
          <view class="custom-field time-field" @tap="vm.openTime()">
            <text :class="time ? 'text-#333' : 'text-#bbb'">
              {{ time || t('booking.timePlaceholder') }}
            </text>
            <wd-icon name="arrow-right" size="28rpx" color="#999" />
          </view>
        </view>
      </view>

      <view class="form-card">
        <view class="section-title">
          <view class="mr-12rpx text-40rpx">
            👥
          </view>
          <text class="title-text">
            {{ t('booking.person') }}
          </text>
        </view>
        <view class="persion-num">
          <view
            v-for="(item, index) in personOptions"
            :key="item"
            class="person-item"
            :class="{ active: personIndex === index }"
            @tap="vm.selectPeople(index)"
          >
            <view class="person-icon">
              {{ personIndex === index ? '✓' : '👥' }}
            </view>
            <view class="person-text">
              {{ item }}
            </view>
          </view>
        </view>
      </view>

      <view class="px-30rpx pt-20rpx">
        <view v-if="configFailed" class="mb-24rpx text-center text-red-500" @tap="vm.load()">
          预约配置加载失败，点击重试
        </view>
        <view v-if="pending" class="mb-24rpx text-center text-26rpx">
          预约申请已提交，结果请联系门店核对，请勿重复提交
        </view>
        <wd-button block custom-class="mb-20rpx" custom-style="height: 96rpx; border-radius: 48rpx; background: #C9935B; border: none; color: white;" :loading="submitting || configLoading" :disabled="configLoading || configFailed || submitting || pending" @click="vm.submit()">
          {{ t('booking.title') }}
        </wd-button>
        <view class="px-20rpx text-center text-24rpx text-#999 leading-relaxed">
          {{ t('booking.tip') }}
        </view>
      </view>

      <wd-datetime-picker
        v-model="currentDate"
        v-model:visible="showDatetimePop"
        :z-index="2000"
        root-portal
        type="datetime"
        :min-date="minDate"
        :formatter="vm.formatter"
        :filter="vm.filter"
        :confirm-button-text="t('common.confirm')"
        :cancel-button-text="t('common.cancel')"
        @cancel="vm.closeTime()"
        @confirm="({ value }: { value: number }) => vm.confirm(value)"
      />
    </view>
  </z-paging>
</template>

<style lang="scss" scoped>
.booking-container {
  padding-bottom: 40rpx;
}

.header-banner {
  position: relative;
  height: 420rpx;
  margin-bottom: -40rpx;
  overflow: hidden;
}

.banner-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #d4a574 0%, #c89968 50%, #b8855a 100%);
  opacity: 0.95;

  &::after {
    position: absolute;
    bottom: -2rpx;
    left: 0;
    width: 100%;
    height: 100rpx;
    content: '';
    background: #fff;
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  }
}

.banner-content {
  position: relative;
  z-index: 2;
  padding-top: 50rpx;
  color: #fff;
  text-align: center;
}

.banner-icon {
  margin-bottom: 16rpx;
  font-size: 88rpx;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10rpx);
  }
}

.form-card {
  position: relative;
  padding: 40rpx 32rpx;
  margin: 30rpx 30rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgb(196 153 104 / 12%);
}

.section-title {
  display: flex;
  align-items: center;
  padding-bottom: 20rpx;
  margin-bottom: 32rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.input-group {
  margin-bottom: 28rpx;
}

.input-label {
  display: flex;
  align-items: center;
  padding-left: 4rpx;
  margin-bottom: 12rpx;
}

.label-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #666;
}

.label-required {
  margin-left: 4rpx;
  font-size: 28rpx;
  color: #ff6b6b;
}

:deep(.custom-field),
.custom-field {
  padding: 24rpx 20rpx !important;
  background: #f8f8f8 !important;
  border-radius: 16rpx !important;
}

.time-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
}

.persion-num {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 24rpx;
}

.person-item {
  position: relative;
  flex: 0 0 calc(50% - 10rpx);
  box-sizing: border-box;
  padding: 32rpx 20rpx;
  overflow: hidden;
  text-align: center;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border: 3rpx solid transparent;
  border-radius: 20rpx;
  transition: all 0.3s;

  &.active {
    background: linear-gradient(135deg, #d4a574 0%, #c89968 100%);
    border-color: #d4a574;
    box-shadow: 0 12rpx 28rpx rgb(212 165 116 / 30%);
    transform: translateY(-4rpx);

    .person-text {
      font-weight: 600;
      color: #fff;
    }
  }
}

.person-icon {
  margin-bottom: 12rpx;
  font-size: 48rpx;
}

.person-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #666;
}
</style>
