<script setup lang="ts">
import { useUserCodeView } from './composables/use-view'

definePage({ style: { navigationBarTitleText: '会员码', navigationStyle: 'custom', enablePullDownRefresh: true } })

const { goBack, user, demo, balance, score, loading, failed, memberCode, codeStatus, refresh, suspend, login } = useUserCodeView()
</script>

<template>
  <view class="member-page min-h-screen bg-#fff8ef p-32rpx">
    <view class="member-navbar">
      <view class="member-navbar-content">
        <button class="member-back" aria-label="返回上一页" @tap="goBack">
          <view class="member-back-chevron" />
        </button>
        <text class="text-32rpx text-#333 font-bold">会员码</text>
      </view>
    </view>
    <view v-if="demo" class="mb-24rpx text-center text-24rpx text-#8b7355">
      开发演示：资产为测试数据，不可用于真实消费
    </view>
    <view class="member-panel">
      <view class="member-badge">
        <wd-icon name="trophy" size="22px" color="#80501f" />
        <text>会员专属</text>
      </view>
      <view class="mt-32rpx text-center text-32rpx text-#8b5a3c font-bold">
        我的会员码
      </view>
      <view class="mb-32rpx text-center text-26rpx text-#999">
        {{ user?.nickname || user?.username || '请先登录顾客账户' }}
      </view>
      <view class="code-frame">
        <view class="code-surface">
          <view class="code-corner top-left" />
          <view class="code-corner top-right" />
          <view class="code-corner bottom-left" />
          <view class="code-corner bottom-right" />
          <wd-icon name="qrcode" size="112px" color="#8b5a3c" />
          <text class="mt-24rpx text-center text-28rpx text-#8b5a3c">
            {{ !user ? '登录后查看会员信息' : codeStatus === 'unavailable' ? '动态会员码服务暂未接入' : '开发会员码演示（不可核销）' }}
          </text>
          <text v-if="memberCode" class="mt-24rpx break-all text-center text-26rpx text-#8b5a3c font-mono">{{ memberCode.code }}</text>
          <text v-if="codeStatus === 'loading'" class="mt-16rpx text-24rpx">会员码加载中…</text>
          <button v-if="codeStatus === 'error' || codeStatus === 'expired'" class="mt-24rpx" @tap="refresh">
            {{ codeStatus === 'expired' ? '演示码已过期，点击刷新' : '会员码加载失败，点击重试' }}
          </button>
          <text class="mt-16rpx text-center text-24rpx text-#999">
            此图标为功能示意，不能扫码核销
          </text>
          <button
            v-if="!user"
            class="member-login"
            style="color: #fff8ef; background: linear-gradient(135deg, #8b7355, #a0826d); border: none; border-radius: 48rpx;"
            hover-class="member-login-pressed"
            @tap="login"
          >
            点击登录成为会员
          </button>
        </view>
      </view>
      <view class="mt-32rpx text-center text-26rpx text-#b58363">
        {{ demo ? '开发演示仅供预览，不可用于真实消费' : '向商家出示会员码，具体权益以门店规则为准' }}
      </view>
    </view>
    <view class="asset-summary">
      <view class="asset-item">
        <view class="asset-symbol wallet-symbol">
          <view class="i-carbon-wallet text-28px text-white" />
        </view>
        <view>
          <view class="mb-8rpx text-26rpx text-#999">
            余额
          </view>
          <view v-if="loading && balance === '—'" class="asset-placeholder" />
          <text v-else class="asset-number text-36rpx text-#8b5a3c font-bold">¥{{ balance }}</text>
        </view>
      </view>
      <view class="asset-divider" />
      <view class="asset-item">
        <view class="asset-symbol score-symbol">
          <wd-icon name="star" size="28px" color="#fff" />
        </view>
        <view>
          <view class="mb-8rpx text-26rpx text-#999">
            我的积分
          </view>
          <view v-if="loading && score === null" class="asset-placeholder" />
          <text v-else class="asset-number text-36rpx text-#8b5a3c font-bold">{{ score ?? '—' }}</text>
        </view>
      </view>
    </view>
    <button v-if="failed" class="mt-24rpx" @tap="refresh">
      资产加载失败，点击重试
    </button>
    <view class="mt-32rpx text-24rpx text-#8b7355">
      每次消费可累积积分，具体权益以门店规则为准。
    </view>
  </view>
</template>

<style lang="scss" scoped>
.member-page {
  padding-top: calc(env(safe-area-inset-top) + 44px + 32rpx);
}

.member-navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  padding-top: env(safe-area-inset-top);
  background: #f8f8f8;
}

.member-navbar-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
}

.member-back {
  position: absolute;
  left: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  margin: 0;
  font-size: 28rpx;
  line-height: 1;
  color: #000;
  background: transparent;
}

.member-back::after {
  border: none;
}

.member-back-chevron {
  width: 10px;
  height: 10px;
  border-bottom: 1.5px solid #000;
  border-left: 1.5px solid #000;
  transform: translateX(2px) rotate(45deg);
}

.member-login {
  width: 100%;
  padding: 20rpx 24rpx;
  margin: 32rpx 0 0;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.5;
  color: #fff8ef;
  background: linear-gradient(135deg, #8b7355, #a0826d);
  border-radius: 48rpx;
  box-shadow: 0 8rpx 20rpx rgb(139 115 85 / 18%);
}

.member-login::after {
  border: none;
}

.member-login-pressed {
  opacity: 0.85;
}

.asset-summary {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx 24rpx;
  margin-top: 32rpx;
  background: #fff;
  border-radius: 24rpx;
}

.asset-item {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  min-width: 0;
}

.asset-symbol {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgb(139 90 60 / 12%);
}

.wallet-symbol {
  background: linear-gradient(135deg, #ffd83d, #ffb21c);
}

.score-symbol {
  background: linear-gradient(135deg, #ff9982, #ff668f);
}

.asset-divider {
  width: 2rpx;
  height: 64rpx;
  background: #f0e5dc;
}

.asset-number {
  display: block;
  min-height: 50rpx;
  line-height: 50rpx;
  font-variant-numeric: tabular-nums;
}

.asset-placeholder {
  width: 120rpx;
  height: 50rpx;
  background: #f5ede4;
  border-radius: 8rpx;
}

.member-panel {
  padding: 40rpx 24rpx;
  text-align: center;
  background: #fffcf9;
  border-radius: 32rpx;
}

.member-badge {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #80501f;
  background: linear-gradient(135deg, #ffda3d, #ffaf20);
  border-radius: 64rpx;
  box-shadow: 0 8rpx 24rpx rgb(255 177 32 / 20%);
}

.code-frame {
  box-sizing: border-box;
  width: 100%;
  max-width: 560rpx;
  padding: 24rpx;
  margin: 0 auto;
  background: #fff;
  border-radius: 28rpx;
  box-shadow: 0 12rpx 40rpx rgb(139 90 60 / 6%);
}

.code-surface {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 440rpx;
  padding: 48rpx 24rpx;
  background: linear-gradient(135deg, #fff6e9, #ffead1);
  border-radius: 8rpx;
}

.code-corner {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border-color: #ffb022;
  border-style: solid;
}

.top-left {
  top: 0;
  left: 0;
  border-width: 6rpx 0 0 6rpx;
}

.top-right {
  top: 0;
  right: 0;
  border-width: 6rpx 6rpx 0 0;
}

.bottom-left {
  bottom: 0;
  left: 0;
  border-width: 0 0 6rpx 6rpx;
}

.bottom-right {
  right: 0;
  bottom: 0;
  border-width: 0 6rpx 6rpx 0;
}
</style>
