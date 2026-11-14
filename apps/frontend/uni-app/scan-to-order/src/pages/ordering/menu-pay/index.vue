<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { useOrderingCurrency } from '@/pages/ordering/index'
import { PhoneInput } from '@/components/phone-input'
import { OrderImage } from '@/components/order-image'
import { fullAddress } from '@/pages/account/profile/address'

/**
 * ============================================================================
 * 【文件概述】结算与支付 / index.vue
 * 页面入口：组装页面状态、生命周期与展示组件，页面仅由路由加载。
 * 【方法与导出清单】
 * - 路由页面。
 * 【综合使用示例】
 * import { ClientRoutes } from '@/pages/routes'
 * // 由页面路由加载 pay/index.vue；页面不作为组件 import。
 * ============================================================================
 */

/**
 * 结算页（View：装配 ViewModel + 渲染）
 * 来源：bee-master/pages/pay/index.wxml
 */
import PayCardSelect from './components/PayCardSelect/index.vue'
import PayGoodsCard from './components/PayGoodsCard/index.vue'
import PaySubmitBar from './components/PaySubmitBar/index.vue'
import { usePayPage } from './composables/use-page'

const { countryCode } = useOrderingCurrency()

definePage({
  style: {
    navigationBarTitleText: '',
  },
})

const vm = usePayPage()
const { t, mobile, phoneCountry, remark, profileReady, goodsError, belowMinAmount, submitButtonText, contactSource, contactLoading, contactError } = vm
// 子 ViewModel 包一层 reactive，模板中自动解包 ref
const delivery = reactive(vm.delivery)
const dt = reactive(vm.diningTime)
const cards = reactive(vm.cards)
const preview = reactive(vm.preview)
const submit = reactive(vm.submit)

onLoad((query) => {
  vm.init(query as Record<string, string>)
})

onShow(() => {
  vm.refresh()
})
</script>

<template>
  <view class="pay-page">
    <text v-if="submit.checkoutReason" class="block p-24rpx text-26rpx text-[#777]">{{ submit.checkoutReason }}。购物车会保留，价格与库存以重新结算时为准。</text>
    <!-- 门店信息 -->
    <view class="shop-card" @tap="delivery.goShopDetail()">
      <OrderImage :src="delivery.shopInfo?.photos?.[0] || delivery.shopInfo?.pic" class="shop-icon shrink-0" label="暂无门店照片" />
      <view class="min-w-0 flex-1">
        <view class="shop-name">
          {{ delivery.shopInfo?.name }}
          <text v-if="delivery.shopInfo?.distance" class="distance">
            {{ delivery.shopInfo?.distance }}km
          </text>
        </view>
        <view class="shop-address">
          {{ delivery.shopInfo?.address }}
        </view>
      </view>
      <view class="i-carbon-chevron-right shrink-0 text-32rpx text-#999" />
    </view>

    <!-- 配送方式 -->
    <view class="card">
      <view class="card-title">
        取餐方式
      </view>
      <view v-if="delivery.showBothTypes" class="mb-8rpx flex gap-20rpx">
        <view
          class="delivery-option"
          :class="{ active: delivery.peisongType === 'zq' }"
          @tap="vm.selectPeisongType('zq')"
        >
          <wd-icon name="store" size="40rpx" :color="delivery.peisongType === 'zq' ? '#fff' : '#8B5A3C'" />
          <view class="option-text">
            {{ t('index.pickup') }}
          </view>
        </view>
        <view
          class="delivery-option"
          :class="{ active: delivery.peisongType === 'kd' }"
          @tap="vm.selectPeisongType('kd')"
        >
          <wd-icon name="location" size="40rpx" :color="delivery.peisongType === 'kd' ? '#fff' : '#8B5A3C'" />
          <view class="option-text">
            {{ t('index.Delivery') }}
          </view>
        </view>
      </view>

      <view v-if="!delivery.showBothTypes" class="py-16rpx text-28rpx">
        {{ delivery.peisongType === 'kd' ? t('index.Delivery') : t('index.pickup') }}
      </view>

      <!-- 配送地址 -->
      <view v-if="delivery.peisongType === 'kd'" class="mt-8rpx">
        <view class="section-divider" />
        <view v-if="delivery.addressLoading" class="py-24rpx text-26rpx text-#666">
          <PageLoading title="地址加载中" />
        </view>
        <view v-else-if="delivery.addressError" class="py-24rpx text-26rpx text-#666" @tap="vm.refresh()">
          地址加载失败，点击重试
        </view>
        <view v-else-if="!delivery.curAddress" class="address-content" @tap="delivery.goAddress()">
          <view class="add-address-btn">
            <wd-icon name="plus-circle" color="#D4A574" size="40rpx" />
            <text class="ml-12rpx text-28rpx text-#D4A574 font-medium">
              {{ delivery.hasAddresses ? '选择收货地址' : t('pay.Addaddress') }}
            </text>
          </view>
        </view>
        <view v-else class="address-content py-16rpx" @tap="delivery.goAddress()">
          <view class="flex flex-1 items-start">
            <view class="mr-16rpx mt-4rpx">
              <wd-icon name="location" size="36rpx" color="#D4A574" />
            </view>
            <view class="flex-1">
              <view class="mb-12rpx text-30rpx text-#2C2C2C font-semibold">
                {{ delivery.curAddress.linkMan }} {{ delivery.curAddress.mobile }}
              </view>
              <view class="text-26rpx text-#666 leading-relaxed">
                {{ fullAddress(delivery.curAddress) }}
              </view>
            </view>
          </view>
          <view class="entry-chevron" aria-hidden="true" />
        </view>
        <view v-if="delivery.deliveryIssue" class="mt-16rpx text-26rpx text-#666" role="status">
          <view>{{ delivery.deliveryIssue.message }}</view>
          <view class="mt-12rpx flex items-center gap-24rpx text-#8b4513">
            <text role="button" @tap="vm.submitCheckout()">{{ delivery.deliveryIssue.actionText }}</text>
          </view>
        </view>
        <button v-if="delivery.feeError && preview.status !== 'ready'" class="mt-16rpx text-26rpx text-[#8b4513]" @tap="vm.refresh()">
          重新加载配送费
        </button>
      </view>

      <!-- 自取手机号 -->
      <view v-if="delivery.peisongType === 'zq'" class="mt-8rpx">
        <view class="section-divider" />
        <view class="flex items-center gap-12rpx py-12rpx">
          <text class="w-96rpx shrink-0 text-28rpx text-#333">手机号</text>
          <view class="min-w-0 flex-1" :title="contactSource">
            <phone-input v-model="mobile" v-model:country="phoneCountry" :disabled="submit.submitLoading" :placeholder="contactLoading ? '读取中…' : '选填手机号'" />
          </view>
        </view>
        <text v-if="contactError" class="text-24rpx text-#8b4513" @tap="vm.loadContact()">读取失败，重试</text>
      </view>

      <view v-if="delivery.peisongType === 'zq'" class="mt-16rpx text-26rpx text-#666">
        在当前门店取餐，下单后请查看订单取餐信息。
      </view>

      <!-- 取餐/送达时间 -->
      <view v-if="dt.enabled" class="mt-8rpx">
        <view class="section-divider" />
        <view class="flex items-center justify-between py-24rpx" @tap="dt.open()">
          <view class="flex items-center text-28rpx text-#2C2C2C font-medium">
            <wd-icon name="clock-circle" size="32rpx" color="#8B5A3C" />
            <text class="ml-12rpx">
              {{ delivery.peisongType === 'zq' ? t('pay.Mealtime') : t('pay.Deliverytime') }}
            </text>
          </view>
          <view class="flex items-center">
            <text class="mr-8rpx text-28rpx" :class="dt.diningTime ? 'text-#D4A574 font-semibold' : 'text-#999'">
              {{ dt.diningTime ? dt.diningTime : t('common.select') }}
            </text>
            <view class="entry-chevron" aria-hidden="true" />
          </view>
        </view>
      </view>
    </view>

    <view v-if="goodsError" class="card" @tap="vm.refresh()">
      商品加载失败，点击重试
    </view>
    <!-- 商品清单 -->
    <PayGoodsCard
      :goods-list="preview.goodsList"
      :total-number="preview.quantity"
      :total-price="preview.subtotal"
    />

    <view v-if="preview.status === 'error'" class="card">
      <view class="text-28rpx text-#666">
        {{ preview.errorMessage }}
      </view>
      <wd-button size="small" plain @click="preview.refreshPreview()">
        重新计算
      </wd-button>
      <wd-button v-if="delivery.peisongType === 'kd'" size="small" plain @click="delivery.goShopDetail()">
        联系门店
      </wd-button>
    </view>

    <!-- 会员卡 -->
    <PayCardSelect
      v-if="cards.cardMyList.length > 0"
      :cards="cards.cardMyList"
      :current="cards.curCard"
      @select="vm.selectCard"
    />

    <!-- 保温袋（自取打包费） -->
    <view v-if="delivery.peisongType === 'zq' && delivery.packagingFee" class="card">
      <view class="card-title">
        {{ t('pay.Insulationbag') }}
      </view>
      <view class="flex flex-col gap-20rpx">
        <view class="bag-option" @tap="vm.setPackagingFeeUse('1')">
          <text class="text-28rpx text-#2C2C2C">
            {{ t('pay.Needbag') }}
          </text>
          <wd-icon
            :name="delivery.packagingFeeUse === '1' ? 'check-circle-fill' : 'uncheck-circle'"
            :color="delivery.packagingFeeUse === '1' ? '#D4A574' : '#ccc'"
            size="22px"
          />
        </view>
        <view class="bag-option" @tap="vm.setPackagingFeeUse('2')">
          <text class="text-28rpx text-#2C2C2C">
            {{ t('pay.UNneedbag') }}
          </text>
          <wd-icon
            :name="delivery.packagingFeeUse === '2' ? 'check-circle-fill' : 'uncheck-circle'"
            :color="delivery.packagingFeeUse === '2' ? '#D4A574' : '#ccc'"
            size="22px"
          />
        </view>
      </view>
    </view>

    <!-- 费用明细 -->
    <view v-if="delivery.peisongType === 'kd'" class="card">
      <view class="fee-item">
        <text class="fee-label">
          {{ t('pay.DeliveryFee') }}
        </text>
        <text class="fee-value" :class="{ 'fee-status': preview.status !== 'ready' }">
          <template v-if="preview.status === 'ready' && preview.yunPrice === 0">免配送费</template>
          <template v-else-if="preview.status === 'ready'">
            <FgPrice :amount="preview.yunPrice" :country-code="countryCode" show-currency-name />
          </template>
          <template v-else>{{ vm.deliveryFeeText.value }}</template>
        </text>
      </view>
      <view v-if="preview.peisongfee?.amount1" class="fee-item">
        <text class="fee-label">
          {{ preview.peisongfee?.fwf1Name }}
        </text>
        <text class="fee-value">
          <FgPrice :amount="preview.peisongfee?.amount1" :country-code="countryCode" show-currency-name />
        </text>
      </view>
      <view v-if="preview.peisongfee?.amount2" class="fee-item">
        <text class="fee-label">
          {{ preview.peisongfee?.fwf2Name }}
        </text>
        <text class="fee-value">
          <FgPrice :amount="preview.peisongfee?.amount2" :country-code="countryCode" show-currency-name />
        </text>
      </view>
      <view v-if="preview.peisongfee?.amount3" class="fee-item">
        <text class="fee-label">
          {{ preview.peisongfee?.fwf3Name }}
        </text>
        <text class="fee-value">
          <FgPrice :amount="preview.peisongfee?.amount3" :country-code="countryCode" show-currency-name />
        </text>
      </view>
    </view>

    <!-- 备注 -->
    <view class="remark-card">
      <wd-icon name="message" size="32rpx" color="#8B5A3C" />
      <text class="ml-12rpx w-120rpx text-28rpx text-#333">
        {{ t('pay.remark') }}
      </text>
      <view class="flex-1">
        <wd-input
          v-model="remark"
          clearable
          align-right
          :placeholder="t('pay.remarkPlaceholder')"
        />
      </view>
    </view>
    <view class="h-200rpx" />

    <PaySubmitBar
      v-if="profileReady"
      :amount="preview.status === 'ready' ? preview.amountReal : preview.subtotal"
      :hint="vm.amountHint.value"
      :notice="vm.settlementNotice.value"
      :label="preview.status === 'ready' ? '应付金额' : '商品小计'"
      :button-text="submitButtonText"
      :disabled="!!submit.checkoutReason || (!vm.canResolveCheckout.value && preview.status !== 'ready') || belowMinAmount || submit.submitLoading"
      :loading="submit.submitLoading"
      @submit="vm.submitCheckout()"
    />
    <PaySubmitBar
      v-else
      :amount="preview.status === 'ready' ? preview.amountReal : preview.subtotal"
      :hint="vm.amountHint.value"
      :notice="vm.settlementNotice.value"
      :label="preview.status === 'ready' ? '应付金额' : '商品小计'"
      :button-text="t('pay.login')"
      @submit="vm.updateUserInfo()"
    />

    <!-- 取餐/送达时间选择 -->
    <wd-datetime-picker
      v-model="dt.pickerValue"
      v-model:visible="dt.show"
      type="time"
      :min-hour="dt.minHour"
      :max-hour="dt.maxHour"
      :min-minute="dt.minMinute"
      :formatter="dt.formatter"
      :filter="dt.filter"
      @change="({ value }: { value: string }) => dt.onChange(value)"
      @cancel="dt.close()"
      @confirm="({ value }: { value: string }) => dt.confirm(value)"
    />
  </view>
</template>

<style lang="scss" scoped>
.pay-page {
  min-height: 100vh;
  padding-top: 24rpx;
  background: linear-gradient(180deg, #fff8f0 0%, #f5f5f5 100%);
}

.card {
  padding: 32rpx;
  margin: 0 24rpx 20rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgb(139 90 60 / 8%);
}

.card-title {
  position: relative;
  padding-left: 20rpx;
  margin-bottom: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #2c2c2c;

  &::before {
    position: absolute;
    top: 50%;
    left: 0;
    width: 8rpx;
    height: 32rpx;
    content: '';
    background: linear-gradient(180deg, #d4a574 0%, #c99960 100%);
    border-radius: 4rpx;
    transform: translateY(-50%);
  }
}

.shop-card {
  display: flex;
  align-items: center;
  padding: 32rpx;
  margin: 0 24rpx 20rpx;
  background: linear-gradient(135deg, #fff 0%, #fffaf5 100%);
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgb(139 90 60 / 8%);
}

.shop-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  margin-right: 24rpx;
  background: linear-gradient(135deg, #f5e6d3 0%, #e8d4b8 100%);
  border-radius: 50%;
}

.shop-name {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #2c2c2c;
}

.distance {
  padding: 4rpx 12rpx;
  margin-left: 12rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #d4a574;
  background: rgb(212 165 116 / 10%);
  border-radius: 12rpx;
}

.shop-address,
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-address {
  font-size: 26rpx;
  line-height: 1.5;
  color: #999;
}

.delivery-option {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 140rpx;
  background: #fafafa;
  border: 2rpx solid transparent;
  border-radius: 20rpx;
  transition: all 0.3s ease;

  .option-text {
    margin-top: 12rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #666;
  }

  &.active {
    background: var(--app-brand-primary, #8b4513);
    border-color: var(--app-brand-primary, #8b4513);
    box-shadow: none;

    .option-text {
      font-weight: 600;
      color: #fff;
    }
  }
}

.section-divider {
  height: 1rpx;
  margin: 32rpx 0 24rpx;
  background: linear-gradient(90deg, rgb(0 0 0 / 0%) 0%, rgb(0 0 0 / 6%) 50%, rgb(0 0 0 / 0%) 100%);
}

.address-content {
  display: flex;
  align-items: center;
  min-height: 100rpx;
}
.entry-chevron {
  flex-shrink: 0;
  width: 14rpx;
  height: 14rpx;
  margin: 0 8rpx;
  border-top: 1px solid #999;
  border-right: 1px solid #999;
  transform: rotate(45deg);
}

.add-address-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 24rpx 0;
  background: linear-gradient(135deg, #fffaf5 0%, #fff5eb 100%);
  border: 2rpx dashed #d4a574;
  border-radius: 16rpx;
}

:deep(.phone-btn) {
  color: #fff !important;
  background: var(--app-brand-primary, #8b4513) !important;
  border: none !important;
}

.pickpoint-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 20rpx;
  background: #fafafa;
  border: 2rpx solid transparent;
  border-radius: 16rpx;

  &.active {
    background: linear-gradient(135deg, #fff9f0 0%, #fff5eb 100%);
    border-color: #d4a574;
  }
}

.bag-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  background: #fafafa;
  border-radius: 16rpx;
}

.fee-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.fee-label {
  font-size: 28rpx;
  color: #666;
}

.fee-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #d4a574;
}

.fee-status {
  max-width: 70%;
  font-size: 26rpx;
  line-height: 1.5;
  text-align: right;
}

.remark-card {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  margin: 0 24rpx 20rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgb(139 90 60 / 8%);
}
</style>
