<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSignInCalendar } from './composables/use-calendar'

definePage({ style: { navigationBarTitleText: '每日签到' } })
const { t } = useI18n()
const vm = useSignInCalendar()
const { monthLabel, calendarDays, signing, loading, failed, signed } = vm
onShow(() => vm.refresh())
</script>

<template>
  <view class="min-h-screen bg-[linear-gradient(160deg,#FFF5E6_0%,#F3DFC6_55%,#FFF8F0_100%)] px-30rpx py-48rpx text-[#5D3A1A]">
    <view class="mb-16rpx text-44rpx font-bold">
      每日签到
    </view>
    <view class="mb-40rpx text-26rpx text-[#8B6F47]">
      每天签到，记录每一份陪伴
    </view>
    <view class="rounded-32rpx bg-[#FFFAF3] p-24rpx shadow-sm">
      <view class="mb-32rpx text-center text-32rpx font-semibold">
        {{ monthLabel }}
      </view>
      <view class="grid grid-cols-7 gap-y-16rpx text-center">
        <view v-for="week in ['日', '一', '二', '三', '四', '五', '六']" :key="week" class="text-24rpx text-[#8B6F47]">
          {{ week }}
        </view>
        <view v-for="day in calendarDays" :key="day.key" class="sign-day" :class="`sign-day--${day.status}`">
          <text class="text-30rpx leading-40rpx">{{ day.day }}</text>
          <text v-if="day.day" class="text-18rpx leading-28rpx">{{ day.status === 'signed' ? '已签到' : day.status === 'today' ? '今天' : day.status === 'missed' ? '未签到' : '待签到' }}</text>
        </view>
      </view>
    </view>
    <view class="my-32rpx text-center text-24rpx text-[#8B6F47]">
      仅可签到当天，历史日期不支持补签
    </view>
    <view v-if="failed" class="mb-24rpx text-center text-26rpx text-red-500" @tap="vm.refresh()">
      签到记录加载失败，点击重试
    </view>
    <wd-button block :loading="signing || loading" :disabled="signed || failed" custom-style="background: linear-gradient(135deg, #D4A574, #A67C52); border: none; color: #fff;" @click="vm.sign()">
      {{ signed ? t('account.sign.signed') : t('account.sign.button') }}
    </wd-button>
  </view>
</template>

<style lang="scss" scoped>
.sign-day {
  display: flex;
  min-height: 92rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 4rpx;
  border-radius: 16rpx;
}
.sign-day--signed {
  color: #fff;
  background: #a67c52;
}
.sign-day--today {
  color: #8b5e34;
  background: #f2dfc4;
  box-shadow: inset 0 0 0 2rpx #c9935b;
}
.sign-day--missed {
  color: #a89682;
}
.sign-day--future {
  color: #b9b0a5;
}
</style>
