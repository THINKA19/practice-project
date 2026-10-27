<script setup lang="ts">
import CouponCard from './components/CouponCard/index.vue'
import CouponPwdDialog from './components/CouponPwdDialog/index.vue'
import { useCouponView } from './composables/use-view'

definePage({
  style: {
    navigationBarTitleText: '',
    disableScroll: true,
  },
})

const { COUPON_TAB_EXCHANGE, t, vm, tabs, activeIndex, templates, mine, showPwdPop, couponPwd, fetchingId, claimedIds, number, pwd, exchangeCouponsLoading, paging, query, reload, changeTab } = useCouponView()
</script>

<template>
  <z-paging ref="paging" :auto="false" :default-page-size="15" :inside-more="true" :refresher-enabled="activeIndex !== COUPON_TAB_EXCHANGE" :loading-more-enabled="activeIndex !== COUPON_TAB_EXCHANGE" :hide-empty-view="activeIndex === COUPON_TAB_EXCHANGE" @query="query">
    <template #loadingMoreDefault>
      <view class="py-24rpx text-center text-24rpx text-#999">
        继续上滑加载更多
      </view>
    </template>
    <template #loadingMoreFail>
      <view class="py-24rpx text-center text-24rpx text-#999">
        加载失败，请下拉刷新后重试
      </view>
    </template>
    <template #top>
      <wd-tabs
        :model-value="activeIndex"
        color="#8B6F47"
        inactive-color="#999"
        @change="({ index }: { index: number }) => changeTab(index)"
      >
        <wd-tab v-for="(item, index) in tabs" :key="index" :title="item" :name="index" />
      </wd-tabs>
    </template>

    <view class="page-container px-32rpx py-32rpx">
      <template v-if="activeIndex === 0">
        <CouponCard
          v-for="item in templates"
          :key="item.id"
          variant="fetch"
          :money-type="item.moneyType"
          :amount="item.moneyMin"
          :threshold="item.moneyHreshold"
          :name="item.name"
          :badge="t('coupons.Vouchers')"
          :desc="`${t('coupons.over')} ${item.moneyHreshold} 元可用`"
          :action-text="item.claimed || claimedIds.has(item.id) ? '已领取' : fetchingId === item.id ? '领取中…' : t('coupons.btn')"
          :disabled="fetchingId === item.id || item.claimed || claimedIds.has(item.id)"
          @action="vm.fetch.getCounpon(item)"
        />
      </template>

      <template v-if="activeIndex === 1">
        <CouponCard
          v-for="item in mine"
          :key="item.id"
          variant="usable"
          :money-type="item.moneyType"
          :amount="item.money"
          :threshold="item.moneyHreshold"
          :name="item.name"
          :badge="t('coupons.Vouchers')"
          :desc="`有效期至 ${item.dateEnd || ''}`"
          :action-text="t('coupons.toUse')"
          @action="vm.touse(item)"
        />
      </template>

      <template v-if="activeIndex === 2">
        <CouponCard
          v-for="item in mine"
          :key="item.id"
          variant="invalid"
          :money-type="item.moneyType"
          :amount="item.money"
          :threshold="item.moneyHreshold"
          :name="item.name"
          :badge="t('coupons.Vouchers')"
          :desc="item.statusStr || ''"
          :action-text="item.statusStr || ''"
        />
      </template>

      <view v-if="activeIndex === COUPON_TAB_EXCHANGE" class="py-24rpx">
        <view class="exchange-card">
          <view class="mb-12rpx text-center text-36rpx text-#333 font-bold">
            兑换优惠券
          </view>
          <view class="mb-48rpx text-center text-26rpx text-#999">
            输入口令码，领取专属优惠
          </view>
          <view class="mb-48rpx">
            <view class="exchange-field mb-24rpx">
              <text class="exchange-label">
                {{ t('coupons.number') }}
              </text>
              <view class="flex-1">
                <wd-input v-model="number" :placeholder="t('coupons.numberPlaceholder')" clearable />
              </view>
            </view>
            <view class="exchange-field">
              <text class="exchange-label">
                {{ t('coupons.pwd') }}
              </text>
              <view class="flex-1">
                <wd-input v-model="pwd" :placeholder="t('coupons.pwdPlaceholder')" clearable />
              </view>
            </view>
          </view>
          <view class="exchange-btn" @tap="vm.exchange.exchangeCoupons()">
            <text v-if="!exchangeCouponsLoading">
              {{ t('coupons.change') }}
            </text>
            <text v-else>
              兑换中...
            </text>
          </view>
        </view>
      </view>
    </view>
    <view class="h-32rpx" />

    <CouponPwdDialog
      v-if="showPwdPop"
      v-model="couponPwd"
      :title="t('coupons.inputpassword')"
      :confirm-text="t('coupons.btn')"
      @close="vm.fetch.closePwd()"
      @confirm="vm.fetch.getCounpon2()"
    />
  </z-paging>
</template>

<style lang="scss" scoped>
.page-container {
  padding-bottom: 32rpx;
  background: linear-gradient(180deg, #fff8f0 0%, #f5f5f5 100%);
}

.exchange-card {
  padding: 48rpx 40rpx;
  background: linear-gradient(135deg, #fff 0%, #fffbf7 100%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgb(139 111 71 / 15%);
}

.exchange-field {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f7f8fa;
  border-radius: 16rpx;
}

.exchange-label {
  width: 100rpx;
  font-size: 30rpx;
  color: #333;
}

.exchange-btn {
  width: 100%;
  padding: 28rpx 0;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, #f4a460 0%, #d2691e 100%);
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgb(212 165 116 / 40%);
}
</style>
