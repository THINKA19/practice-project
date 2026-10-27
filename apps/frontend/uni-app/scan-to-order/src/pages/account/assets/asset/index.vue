<script setup lang="ts">
/**
 * 我的钱包：余额、充值套餐/自定义金额、充值记录与资金明细入口
 */
import { useI18n } from 'vue-i18n'
import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'
import RechargePlans from './components/RechargePlans/index.vue'
import { CUSTOM_RULE_INDEX, useAssetPage } from './composables/use-page'

definePage({
  style: {
    navigationBarTitleText: '',
  },
})

const { t } = useI18n()
const vm = useAssetPage()
const { balance, freeze, rechargeSendRules, ruleSelIndex, showRechargePop, amount2, paymentShow, money, paying, loading, loaded, failed, demo } = vm

onLoad(() => {
  vm.init()
})

onShow(() => {
  vm.refresh()
})
</script>

<template>
  <view class="wallet-container">
    <!-- 余额 -->
    <view class="balance-card">
      <view class="flex items-center">
        <text class="mr-12rpx text-36rpx">
          💰
        </text>
        <text class="text-28rpx text-white/90">
          {{ t('wallet.balance') }}
        </text>
      </view>
      <view class="mt-24rpx flex items-baseline text-white">
        <text class="mr-8rpx text-36rpx font-600">
          ¥
        </text>
        <text class="text-72rpx font-700">
          {{ balance }}
        </text>
      </view>
      <view class="circle circle-1" />
      <view class="circle circle-2" />
      <view v-if="loading && !loaded" class="wallet-status">
        {{ t('common.loading') }}
      </view>
      <view v-else-if="failed" class="wallet-status" @tap="vm.refresh()">
        {{ t('common.loadFailed') }} · {{ t('common.retry') }}
      </view>
    </view>

    <view v-if="freeze !== '0.00'" class="px-40rpx pt-24rpx text-24rpx text-#8b7355">
      {{ t('wallet.frozen') }} ¥{{ freeze }}
    </view>
    <!-- 充值 -->
    <view class="section">
      <view class="section-title">
        <text class="mr-12rpx">
          🎁
        </text>
        <text>{{ t('wallet.recharge') }}</text>
      </view>
      <RechargePlans
        :rules="rechargeSendRules"
        :selected="ruleSelIndex"
        :custom-index="CUSTOM_RULE_INDEX"
        @select="vm.changePersionNum"
      />
      <view class="submit-btn mt-40rpx" @tap="vm.submit1">
        {{ t('wallet.confirmBtn') }}
      </view>
    </view>

    <!-- 账户记录 -->
    <view class="section">
      <view class="section-title">
        <text class="mr-12rpx">
          📋
        </text>
        <text>账户记录</text>
      </view>
      <view class="function-item" @tap="navigate(ClientRoutes.Account.rechargeLog)">
        <view class="function-icon bg-#E3F2FD">
          💳
        </view>
        <view class="flex-1">
          <view class="text-28rpx text-#333 font-500">
            {{ t('wallet.payLog.title') }}
          </view>
          <view class="mt-4rpx text-22rpx text-#999">
            查看充值明细
          </view>
        </view>
        <view class="record-chevron" />
      </view>
      <view class="function-item" @tap="navigate(ClientRoutes.Account.cashLog)">
        <view class="function-icon bg-#FFF3E0">
          💸
        </view>
        <view class="flex-1">
          <view class="text-28rpx text-#333 font-500">
            {{ t('wallet.cashLog.title') }}
          </view>
          <view class="mt-4rpx text-22rpx text-#999">
            查看资金收支明细
          </view>
        </view>
        <view class="record-chevron" />
      </view>
    </view>
    <view class="h-60rpx" />

    <!-- 自定义金额 -->
    <wd-popup v-model="showRechargePop" position="bottom" round closable safe-area-inset-bottom @close="vm.onClose">
      <view class="px-32rpx pb-40rpx pt-48rpx">
        <view class="mb-32rpx text-center text-32rpx text-#333 font-600">
          自定义充值金额
        </view>
        <view class="rounded-16rpx bg-#f7f4ef p-24rpx">
          <view class="mb-20rpx text-28rpx text-#5c4630 font-600">
            {{ t('wallet.amount') }}
          </view>
          <view class="flex items-center rounded-12rpx bg-white px-24rpx">
            <text class="mr-16rpx text-36rpx text-#8b6f47">¥</text>
            <view class="min-w-0 flex-1">
              <wd-input v-model="amount2" type="digit" clearable custom-input-class="!text-#333" placeholder-style="color: #8a8178;" :placeholder="t('wallet.amountPlaceholder')" />
            </view>
          </view>
        </view>
        <view class="submit-btn mt-40rpx" @tap="vm.submit2">
          {{ t('wallet.confirmBtn') }}
        </view>
      </view>
    </wd-popup>

    <wd-popup v-model="paymentShow" position="bottom" round :closable="!paying" :close-on-click-modal="!paying" safe-area-inset-bottom>
      <view class="p-40rpx text-center">
        <view class="mb-24rpx text-32rpx font-600">
          {{ t('wallet.recharge') }}
        </view>
        <view class="mb-24rpx text-56rpx text-#8b7355 font-700">
          ¥{{ money.toFixed(2) }}
        </view>
        <view v-if="demo" class="mb-24rpx text-24rpx text-#999">
          开发演示，不产生真实扣款
        </view>
        <wd-button block :loading="paying" @click="vm.paymentOk">
          确认演示充值
        </wd-button>
        <view v-if="!paying" class="mt-24rpx text-#999" @tap="vm.paymentCancel">
          {{ t('common.cancel') }}
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<style lang="scss" scoped>
.wallet-status {
  position: absolute;
  top: 20rpx;
  right: 24rpx;
  z-index: 1;
  font-size: 22rpx;
  color: #fff;
}

.record-chevron {
  width: 14rpx;
  height: 14rpx;
  border-top: 3rpx solid #bbb;
  border-right: 3rpx solid #bbb;
  transform: rotate(45deg);
}

.wallet-container {
  min-height: 100vh;
  padding-top: 32rpx;
  background: linear-gradient(180deg, #fdf6ef 0%, #fff 100%);
}

.balance-card {
  position: relative;
  padding: 48rpx 40rpx;
  margin: 0 32rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #d4a373 0%, #a67c52 100%);
  border-radius: 32rpx;
  box-shadow: 0 12rpx 40rpx rgb(166 124 82 / 30%);
}

.circle {
  position: absolute;
  background: rgb(255 255 255 / 10%);
  border-radius: 50%;
}

.circle-1 {
  top: -60rpx;
  right: -40rpx;
  width: 220rpx;
  height: 220rpx;
}

.circle-2 {
  right: 120rpx;
  bottom: -80rpx;
  width: 160rpx;
  height: 160rpx;
}

.section {
  padding: 32rpx;
  margin: 32rpx 32rpx 0;
  background: #fff;
  border-radius: 28rpx;
  box-shadow: 0 4rpx 20rpx rgb(0 0 0 / 5%);
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 28rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #d4a373 0%, #a67c52 100%);
  border-radius: 44rpx;
  box-shadow: 0 8rpx 20rpx rgb(166 124 82 / 30%);
}

.function-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.function-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  margin-right: 24rpx;
  font-size: 36rpx;
  border-radius: 20rpx;
}
</style>
