<script setup lang="ts">
import AddressEditForm from './components/AddressEditForm/index.vue'
import { useAddressView } from './composables/use-view'

definePage({
  style: {
    navigationBarTitleText: '收货地址',
    navigationStyle: 'custom',
    navigationBarBackgroundColor: '#FFFFFF',
    backgroundColor: '#F5F6F8',
  },
})

const { t, vm, addressRegion, addressList, loaded, addressEdit, addressData, failed, loading, editingLoading, saving } = useAddressView()
</script>

<template>
  <view class="page-bg">
    <wd-navbar left-arrow safe-area-inset-top custom-style="background-color: #FFFFFF;" @click-left="vm.goBack()">
      <template #title>
        <text class="address-title">{{ t('account.profile.address.title') }}</text>
      </template>
    </wd-navbar>
    <view v-if="failed && !addressEdit && !addressList.length" class="px-48rpx py-120rpx text-center text-28rpx text-#91775e">
      {{ t('account.profile.address.unavailable') }}
    </view>
    <view v-if="addressList.length > 0 && !addressEdit" class="address-list">
      <view class="address-cards">
        <view v-for="item in addressList" :key="item.id" class="a-address">
          <view class="left-text">
            <view class="contact-heading">
              <text class="contact-name">{{ item.linkMan }}</text>
              <text class="contact-phone">{{ item.mobile }}</text>
              <text v-if="item.isDefault" class="default-tag" @tap.stop>默认地址</text>
              <button v-else class="set-default" :disabled="saving" @tap.stop="vm.selectTap(item.id)">
                设为默认
              </button>
            </view>
            <view class="address-box">
              {{ addressRegion(item) }}
            </view>
            <view class="address-detail">
              {{ item.address }}
            </view>
          </view>
          <view class="address-actions">
            <button class="address-action" aria-label="编辑地址" :disabled="saving" @tap="vm.editAddress(item.id)">
              <wd-icon name="edit" size="32rpx" />
            </button>
            <view class="address-action-separator" aria-hidden="true" />
            <button class="address-action delete-action" aria-label="删除地址" :disabled="saving" @tap="vm.deleteAddress(item.id)">
              <wd-icon name="delete" size="32rpx" />
            </button>
          </view>
        </view>
      </view>
      <view class="bottom-box">
        <button class="add-address-button" :disabled="saving" @tap="vm.addAddress()">
          <wd-icon name="plus" color="#FFFFFF" size="32rpx" />
          <text>{{ t('account.profile.address.add') }}</text>
        </button>
      </view>
    </view>

    <view v-if="loaded && !loading && !failed && addressList.length === 0 && !addressEdit" class="address-empty">
      <view class="content-1">
        {{ t('account.profile.address.empty') }}
      </view>
      <view class="content-2">
        {{ t('account.profile.address.pleaseAdd') }}
      </view>
      <button class="empty-btn" @tap="vm.addAddress()">
        {{ t('account.profile.address.add') }}
      </button>
    </view>

    <view v-if="addressEdit && editingLoading" class="p-48rpx text-center">
      正在加载地址详情…
    </view>
    <AddressEditForm
      v-if="addressEdit && !editingLoading"
      :saving="saving"
      :draft="addressData"
      @input="vm.setField"
      @save="vm.bindSave()"
      @cancel="vm.editCancel()"
    />
  </view>
</template>

<style scoped>
.page-bg {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background: #f5f6f8;
  --wot-color-theme: #ea8d79;
  color: #333;
}
.address-list {
  flex: 1;
  padding: 24rpx 28rpx calc(180rpx + env(safe-area-inset-bottom));
}
.a-address {
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-sizing: border-box;
  width: 100%;
  padding: 28rpx;
  margin-bottom: 24rpx;
  background: #ffffff;
  border: 1px solid #ededed;
  border-left: 6rpx solid #ea8d79;
  border-radius: 24rpx;
}
.left-text {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.contact-heading {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 12rpx;
}
.contact-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}
.default-tag {
  flex-shrink: 0;
  padding: 4rpx 12rpx;
  font-size: 22rpx;
  line-height: 32rpx;
  color: #d87b6a;
  border: 1px solid #ea8d79;
  border-radius: 8rpx;
}
.contact-phone {
  font-size: 28rpx;
  line-height: 40rpx;
  color: #555;
}
.address-box {
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 40rpx;
  color: #777;
}
.address-detail {
  margin-top: 8rpx;
  font-size: 28rpx;
  line-height: 40rpx;
  color: #555;
}
.address-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  flex-shrink: 0;
  gap: 16rpx;
}
.address-action {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 64rpx;
  height: 64rpx;
  margin: 0;
  padding: 0;
  line-height: 1;
  color: #777;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 50%;
}
.address-action-separator {
  width: 1px;
  height: 32rpx;
  flex-shrink: 0;
  background: #dedede;
}
.address-action::after,
.set-default::after,
.add-address-button::after {
  border: 0;
}
.set-default {
  margin: 0;
  padding: 4rpx 10rpx;
  font-size: 22rpx;
  line-height: 32rpx;
  color: #d87b6a;
  background: #ffffff;
  border: 1px solid #ea8d79;
  border-radius: 8rpx;
}
.delete-action {
  color: #b65b58;
}
.bottom-box {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1px solid #eee;
}
.add-address-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 96rpx;
  padding: 0;
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
  background: linear-gradient(110deg, #ff9d7e, #e98775);
  border-radius: 48rpx;
}
.address-title {
  color: #333;
  font-size: 32rpx;
  font-weight: 400;
}
.address-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  padding: 40rpx 40rpx calc(40rpx + env(safe-area-inset-bottom));
  text-align: center;
}
.content-1 {
  font-size: 36rpx;
  line-height: 52rpx;
  font-weight: 600;
  color: #a88873;
}
.content-2 {
  margin-top: 32rpx;
  font-size: 32rpx;
  line-height: 48rpx;
  font-weight: 400;
  color: #cba187;
}
.empty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 520rpx;
  max-width: 100%;
  height: 128rpx;
  margin: 232rpx auto 0;
  padding: 0;
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(110deg, #ff9d7e, #e98775);
  border-radius: 80rpx;
  box-shadow: 0 12rpx 28rpx rgb(233 135 117 / 15%);
}
.empty-btn::after {
  border: 0;
}
</style>
