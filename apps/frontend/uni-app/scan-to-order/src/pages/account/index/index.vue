<script setup lang="ts">
/**
 * 我的（tab）：用户信息、资产、功能菜单、昵称修改、客服、核销、管理后台
 */
import { useI18n } from 'vue-i18n'

import MyAssetCards from './components/MyAssetCards/index.vue'
import MyBanner from './components/MyBanner/index.vue'
import MyMenuItem from './components/MyMenuItem/index.vue'
import MyUserCard from './components/MyUserCard/index.vue'
import { useAccountPage } from './composables/use-page'

definePage({
  style: {
    navigationBarTitleText: '',
    disableScroll: true,
  },
})

const { t } = useI18n()
const vm = useAccountPage()
const { user, nick, avatar, couponCount, balance, score, assetStatus, myBg, customerServiceType } = vm

onLoad(() => {
  vm.init()
})

onShow(() => {
  vm.refresh()
})
</script>

<template>
  <z-paging fixed :use-page-scroll="false" :auto="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false">
    <view class="page-container">
      <MyUserCard
        :my-bg="myBg"
        :avatar="avatar"
        :nick="nick"
        :has-login="!!user"
        :level-name="user?.userLevel?.name"
        @choose-avatar="vm.onChooseAvatar"
        @edit-nick="vm.editNick"
        @login="vm.login"
        @vip="vm.govip"
        @user-code="vm.goUserCode"
      />

      <MyBanner @select="vm.navTo" />

      <!-- 资产 -->
      <MyAssetCards
        :coupon-count="couponCount"
        :balance="balance"
        :score="score"
        :status="assetStatus"
        @coupons="vm.goCoupons"
        @balance="vm.goBalance"
        @score="vm.goScorelog"
      />

      <view class="px-32rpx">
        <!-- 常用功能 -->
        <view class="mb-32rpx">
          <view class="menu-title">
            <view class="title-dot" />
            <text>常用功能</text>
          </view>
          <view class="mb-16rpx flex gap-20rpx">
            <view class="menu-item" @tap="vm.scanOrderCode">
              <view class="menu-icon-wrapper from-#E3F2FD to-#BBDEFB bg-gradient-to-br">
                <wd-icon name="scan" size="22px" color="#2196F3" />
              </view>
              <text class="menu-text">
                {{ t('account.scanHx') }}
              </text>
            </view>
            <view class="menu-item" @tap="vm.navTo('每日签到')">
              <view class="menu-icon-wrapper from-#FCE4EC to-#F8BBD0 bg-gradient-to-br">
                <wd-icon name="calendar-line" size="22px" color="#E91E63" />
              </view>
              <text class="menu-text">
                {{ t('account.signDaily') }}
              </text>
            </view>
            <view class="menu-item" @tap="vm.navTo('预约订座')">
              <view class="menu-icon-wrapper from-#F3E5F5 to-#E1BEE7 bg-gradient-to-br">
                <wd-icon name="time-line" size="22px" color="#9C27B0" />
              </view>
              <text class="menu-text">
                {{ t('booking.title') }}
              </text>
            </view>
            <view class="menu-item" @tap="vm.navTo('优惠买单')">
              <view class="menu-icon-wrapper from-#FFF9C4 to-#FFF59D bg-gradient-to-br">
                <wd-icon name="stamp" size="22px" color="#FFA000" />
              </view>
              <text class="menu-text">
                {{ t('account.youhuimaidan') }}
              </text>
            </view>
          </view>
        </view>

        <!-- 我的服务 -->
        <view class="mb-32rpx">
          <view class="menu-title">
            <view class="title-dot" />
            <text>我的服务</text>
          </view>
          <view class="menu-list">
            <MyMenuItem icon="list" :text="t('account.orders')" from="#E8F5E9" to="#C8E6C9" color="#4CAF50" @select="vm.navTo('我的订单')" />
            <MyMenuItem icon="location" :text="t('account.address')" from="#E3F2FD" to="#BBDEFB" color="#2196F3" @select="vm.navTo('收货地址')" />
          </view>
        </view>

        <!-- 其他设置 -->
        <view class="mb-32rpx">
          <view class="menu-title">
            <view class="title-dot" />
            <text>其他设置</text>
          </view>
          <view class="menu-list">
            <MyMenuItem icon="info-circle" :text="t('account.aboutUs')" from="#F3E5F5" to="#E1BEE7" color="#9C27B0" @select="vm.navTo('关于我们')" />
            <MyMenuItem v-if="customerServiceType === 'QW'" icon="headset" :text="t('account.Contact')" from="#E0F2F1" to="#B2DFDB" color="#009688" @select="vm.customerService" />
            <MyMenuItem icon="message" :text="t('account.feedback')" from="#FFF3E0" to="#FFE0B2" color="#FF9800" @select="vm.navTo('意见反馈')" />
          </view>
        </view>

        <!-- 商家管理 -->
        <view class="mb-32rpx">
          <view class="menu-title">
            <view class="title-dot" />
            <text>商家服务</text>
            <text class="ml-16rpx text-22rpx text-#999 font-400">商家专用</text>
          </view>
          <view class="menu-list">
            <MyMenuItem icon="store" text="进入商家后台" from="#E8F5E9" to="#C8E6C9" color="#4CAF50" @select="vm.navTo('商家后台')" />
            <MyMenuItem icon="edit" text="申请商家入驻" from="#FFF3E0" to="#FFE0B2" color="#FF9800" @select="vm.navTo('申请商家入驻')" />
          </view>
        </view>

        <!-- 骑手管理 -->
        <view class="mb-32rpx">
          <view class="menu-title">
            <view class="title-dot" />
            <text>骑手管理</text>
            <text class="ml-16rpx text-22rpx text-#999 font-400">骑手专用</text>
          </view>
          <view class="menu-list">
            <MyMenuItem icon="dashboard" text="进入骑手工作台" from="#E3F2FD" to="#BBDEFB" color="#2196F3" @select="vm.navTo('骑手工作台')" />
          </view>
        </view>
      </view>
    </view>
  </z-paging>
</template>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  padding-bottom: 40rpx;
  background: linear-gradient(180deg, #fff5e6 0%, #fff 50%);
}

.menu-title {
  display: flex;
  align-items: center;
  padding-left: 8rpx;
  margin-bottom: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.title-dot {
  width: 8rpx;
  height: 28rpx;
  margin-right: 16rpx;
  background: linear-gradient(180deg, #8b7355 0%, #a0826d 100%);
  border-radius: 4rpx;
}

.menu-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 16rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgb(0 0 0 / 6%);
}

.menu-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 16rpx;
  border-radius: 50%;
}

.menu-text {
  font-size: 24rpx;
  line-height: 1.4;
  color: #666;
  text-align: center;
}

.menu-list {
  overflow: hidden;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgb(0 0 0 / 6%);
}
</style>
