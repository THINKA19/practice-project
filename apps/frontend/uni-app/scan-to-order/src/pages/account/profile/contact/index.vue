<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import ContactChannelCard from './components/ContactChannelCard/index.vue'
import { useContactConfig } from './composables/use-config'

definePage({ style: { navigationBarTitleText: '联系客服' } })
const { serviceData, recommendedId, canOpenLinks, toggleChannel, isExpanded, openLink, nativeContactAvailable, loading, loaded, failed, load, copy, previewQr, qrErrors, markQrFailed, retryQr, showTelTips } = useContactConfig()
onLoad(() => {
  void load()
})
</script>

<template>
  <view class="min-h-screen bg-#fdf8f3 px-32rpx pb-64rpx pt-40rpx text-#76583e">
    <view class="mb-32rpx rounded-32rpx bg-#eee3d5 p-36rpx">
      <view class="text-42rpx font-600">
        有问题，随时联系我们
      </view>
      <view class="mt-16rpx text-26rpx text-#91775e leading-relaxed">
        订单咨询、使用帮助与服务建议，选择您方便的方式。
      </view>
      <view v-if="serviceData.business_time" class="mt-24rpx inline-block rounded-24rpx bg-white/70 px-24rpx py-12rpx text-24rpx">
        服务时间 · {{ serviceData.business_time }}
      </view>
    </view>

    <view v-if="loading && !loaded" class="rounded-28rpx bg-white p-48rpx text-center text-28rpx" role="status">
      正在加载联系方式…
    </view>
    <view v-else-if="failed && !loaded" class="rounded-28rpx bg-white p-40rpx text-center">
      <view class="mb-24rpx text-28rpx">
        客服信息加载失败，请稍后重试
      </view>
      <button class="contact-button primary" @tap="load">
        重新加载
      </button>
    </view>
    <template v-else>
      <view v-if="serviceData.demo" class="mb-28rpx rounded-20rpx bg-#f2e9dc p-24rpx text-24rpx leading-relaxed">
        开发演示：账号与二维码仅用于展示和扫码测试，不能添加真实客服。正式渠道由后台配置。
      </view>
      <view v-if="failed" class="mb-24rpx text-26rpx">
        更新失败，已保留上次配置。<text class="underline" @tap="load">点击重试</text>
      </view>
      <view v-if="loading" class="mb-24rpx text-24rpx" role="status">
        正在更新联系方式…
      </view>
      <view v-if="!serviceData.channels.length && !serviceData.phone && !nativeContactAvailable" class="rounded-28rpx bg-white p-40rpx text-center text-28rpx leading-relaxed">
        暂未配置联系方式，请稍后再试。
      </view>

      <view v-if="serviceData.channels.length > 1" class="mb-20rpx text-24rpx text-#a1876d">
        默认展开推荐客服，其他渠道点击展开。
      </view>
      <ContactChannelCard
        v-for="item in serviceData.channels" :key="item.id"
        :channel="item" :expanded="isExpanded(item.id)" :recommended="item.id === recommendedId"
        :demo="serviceData.demo" :qr-failed="!!qrErrors[item.id]" :can-open-links="canOpenLinks"
        @toggle="toggleChannel(item.id)" @copy="copy" @preview="previewQr"
        @qr-error="markQrFailed" @qr-retry="retryQr" @open="openLink"
      />

      <view v-if="serviceData.phone" class="mb-28rpx rounded-28rpx bg-white p-32rpx shadow-sm">
        <view class="text-32rpx font-600">
          电话客服
        </view>
        <view class="my-24rpx break-all text-36rpx">
          {{ serviceData.phone }}
        </view>
        <view class="flex gap-20rpx">
          <button class="contact-button primary flex-1" @tap="showTelTips">
            拨打电话
          </button>
          <button class="contact-button flex-1" @tap="copy(serviceData.phone)">
            复制号码
          </button>
        </view>
      </view>
      <!-- #ifdef MP-WEIXIN -->
      <button v-if="serviceData.wechat_contact_enabled" class="contact-button primary" open-type="contact">
        微信在线客服
      </button>
      <!-- #endif -->
      <view v-if="serviceData.channels.length" class="mt-32rpx text-center text-22rpx text-#a1876d leading-relaxed">
        扫描或预览对应平台二维码，也可复制账号后前往相应应用添加。
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
.contact-button {
  margin-right: 0;
  margin-left: 0;
  padding: 0 20rpx;
  font-size: 25rpx;
  line-height: 76rpx;
  color: #76583e;
  background: #eee3d5;
  border-radius: 38rpx;

  &::after {
    border: none;
  }
  &.primary {
    color: #fff;
    background: #557660;
  }
}
</style>
