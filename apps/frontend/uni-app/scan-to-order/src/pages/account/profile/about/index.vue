<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useAboutPage } from './composables/use-page'

definePage({ style: { navigationBarTitleText: '关于我们' } })
const { page, demo, loading, failed, init, copyContact, contactService } = useAboutPage()
onLoad((query) => {
  void init(query as {
    key?: string
  })
})
</script>

<template>
  <view class="min-h-screen bg-#fdf8f3 px-32rpx pb-64rpx pt-48rpx">
    <view class="mb-40rpx text-center">
      <view class="mx-auto mb-24rpx h-112rpx w-112rpx flex items-center justify-center rounded-32rpx bg-#eee3d5">
        <view class="i-carbon-favorite text-56rpx text-#8b7355" />
      </view>
      <view class="text-44rpx text-#76583e font-600">
        {{ page?.info.title || '关于我们' }}
      </view>
      <view class="mt-16rpx text-26rpx text-#a1876d">
        用心做好每一次服务
      </view>
      <view v-if="demo" class="mt-16rpx text-22rpx text-#8b7355">
        开发演示：以下为示例介绍内容
      </view>
    </view>

    <view class="rounded-28rpx bg-white p-32rpx shadow-sm">
      <view v-if="loading" class="py-64rpx text-center text-28rpx text-#a1876d" role="status">
        正在加载介绍…
      </view>
      <view v-else-if="failed" class="py-40rpx text-center">
        <view class="mb-24rpx text-28rpx text-#8b7355">
          内容加载失败，请稍后重试
        </view>
        <button class="about-button" @tap="init()">
          重新加载
        </button>
      </view>
      <rich-text v-else-if="page?.info.content" class="text-28rpx text-#53483c leading-[1.8]" :nodes="page.info.content" />
      <view v-else class="py-64rpx text-center text-28rpx text-#a1876d">
        介绍内容正在准备中，您可以通过下方入口联系我们
      </view>
    </view>

    <view class="mt-32rpx rounded-28rpx bg-#f2e9dc p-32rpx">
      <view class="mb-12rpx text-30rpx text-#76583e font-600">
        联系我们
      </view>
      <view class="mb-24rpx text-25rpx text-#8b7355 leading-relaxed">
        如有订单或服务问题，欢迎通过客服入口获取帮助。
      </view>
      <view v-if="page?.info.contact" class="mb-24rpx break-all text-26rpx text-#76583e">
        {{ page.info.contact }}
      </view>
      <view class="flex flex-wrap gap-20rpx">
        <button v-if="page?.info.contact" class="about-button flex-1" @tap="copyContact">
          复制联系方式
        </button>
        <button class="about-button about-button-primary flex-1" @tap="contactService">
          联系客服
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.about-button {
  margin: 0;
  padding: 0 24rpx;
  font-size: 26rpx;
  line-height: 80rpx;
  color: #76583e;
  background: #e8d7c0;
  border-radius: 40rpx;

  &::after {
    border: none;
  }
}
.about-button-primary {
  color: #fff;
  background: #557660;
}
</style>
