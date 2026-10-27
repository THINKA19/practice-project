<script setup lang="ts">
import { computed } from 'vue'
import type { ContactChannel } from '../../models/types'

defineOptions({ name: 'ContactChannelCard' })

const props = defineProps<{ channel: ContactChannel, expanded: boolean, recommended: boolean, demo: boolean, qrFailed: boolean, canOpenLinks: boolean }>()
const emit = defineEmits<{
  toggle: []
  copy: [value: string]
  preview: [channel: ContactChannel]
  qrError: [id: string]
  qrRetry: [id: string]
  open: [url: string]
}>()
const accountLabel = computed(() => ({ wechat: '微信号', wechat_official: '公众号名称', qq: 'QQ 号', qq_group: '群号', telegram: '用户名', facebook: '主页名称', x: '用户名', whatsapp: '联系号码', instagram: '用户名', other: '账号' })[props.channel.kind])
const copyLabel = computed(() => ({ wechat: '复制微信号', wechat_official: '复制公众号', qq: '复制 QQ 号', qq_group: '复制群号', telegram: '复制用户名', facebook: '复制名称', x: '复制用户名', whatsapp: '复制号码', instagram: '复制用户名', other: '复制账号' })[props.channel.kind])
const visitLabel = computed(() => ({ wechat: '联系微信客服', wechat_official: '访问公众号', qq: '联系 QQ 客服', qq_group: '申请加入 QQ 群', telegram: '打开 Telegram', facebook: '访问 Facebook 主页', x: '访问 X 主页', whatsapp: '联系 WhatsApp', instagram: '访问 Instagram', other: '打开联系链接' })[props.channel.kind])
</script>

<template>
  <view class="mb-24rpx overflow-hidden rounded-28rpx bg-white shadow-sm">
    <view class="flex items-center gap-20rpx p-32rpx">
      <view class="min-w-0 flex-1">
        <view class="flex flex-wrap items-center gap-12rpx">
          <view class="text-32rpx text-#76583e font-600">
            {{ channel.name }}
          </view>
          <text v-if="recommended" class="rounded-16rpx bg-#edf2ec px-12rpx py-4rpx text-20rpx text-#557660">推荐</text>
        </view>
        <view v-if="channel.description" class="mt-10rpx text-24rpx text-#a1876d leading-relaxed">
          {{ channel.description }}
        </view>
      </view>
      <button class="compact-button" :aria-expanded="expanded" :aria-label="`${expanded ? '收起' : '展开'}${channel.name}`" @tap="emit('toggle')">
        {{ expanded ? '收起' : '展开' }}
      </button>
    </view>
    <view v-if="expanded" class="border-t border-#f4ede4 px-32rpx pb-32rpx pt-28rpx">
      <view v-if="channel.account" class="flex items-center gap-20rpx">
        <view class="min-w-0 flex-1">
          <view class="mb-8rpx text-22rpx text-#a1876d">
            {{ accountLabel }}
          </view>
          <view class="break-all text-28rpx text-#76583e font-500">
            {{ channel.account }}
          </view>
        </view>
        <button class="compact-button" @tap="emit('copy', channel.account)">
          {{ copyLabel }}
        </button>
      </view>
      <view v-if="channel.qr_image" class="mt-28rpx text-center">
        <view class="mx-auto max-w-full w-360rpx rounded-20rpx bg-#fcfaf6 p-12rpx">
          <image v-if="!qrFailed" :src="channel.qr_image" mode="aspectFit" class="h-360rpx max-w-full w-360rpx" :show-menu-by-longpress="true" @tap="emit('preview', channel)" @error="emit('qrError', channel.id)" />
          <view v-else class="h-360rpx flex flex-col items-center justify-center text-26rpx text-#a1876d leading-relaxed">
            <text>二维码加载失败</text>
            <button class="compact-button mt-20rpx" @tap="emit('qrRetry', channel.id)">
              重新加载
            </button>
          </view>
        </view>
        <view class="mt-12rpx text-22rpx text-#a1876d">
          {{ demo ? '演示二维码 · 点击放大' : '点击二维码放大查看' }}
        </view>
      </view>
      <view v-else-if="!channel.link && !channel.contact_link" class="mt-24rpx text-24rpx text-#a1876d leading-relaxed">
        可复制账号后，前往对应应用添加。
      </view>
      <view v-if="channel.link" class="mt-28rpx">
        <view class="mb-10rpx flex items-center justify-between gap-16rpx">
          <text class="text-22rpx text-#a1876d">{{ demo ? '示例主页 / 联系链接' : '主页 / 联系链接' }}</text>
          <button class="compact-button" @tap="emit('copy', channel.link)">
            复制链接
          </button>
        </view>
        <view class="break-all text-24rpx text-#76583e leading-relaxed">
          {{ channel.link }}
        </view>
        <button v-if="canOpenLinks" class="visit-button mt-24rpx" :disabled="demo" @tap="emit('open', channel.link)">
          {{ demo ? `${visitLabel}（演示）` : visitLabel }}
        </button>
        <view v-else class="mt-12rpx text-22rpx text-#a1876d leading-relaxed">
          复制链接后，请在浏览器或相应应用中打开。
        </view>
      </view>
      <view v-if="channel.contact_link" class="mt-24rpx border-t border-#f4ede4 pt-24rpx">
        <view class="mb-10rpx flex items-center justify-between gap-16rpx">
          <text class="text-22rpx text-#a1876d">{{ channel.kind === 'facebook' ? 'Messenger 私信链接' : '直接联系链接' }}</text>
          <button class="compact-button" @tap="emit('copy', channel.contact_link)">
            复制链接
          </button>
        </view>
        <view class="break-all text-24rpx text-#76583e leading-relaxed">
          {{ channel.contact_link }}
        </view>
        <button v-if="canOpenLinks" class="visit-button mt-24rpx" :disabled="demo" @tap="emit('open', channel.contact_link)">
          {{ channel.kind === 'facebook' ? 'Messenger 私信' : '直接联系' }}{{ demo ? '（演示）' : '' }}
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.compact-button {
  flex-shrink: 0;
  margin-right: 0;
  margin-left: 0;
  padding: 0 20rpx;
  font-size: 23rpx;
  line-height: 68rpx;
  color: #557660;
  background: #edf2ec;
  border-radius: 16rpx;
}
.visit-button {
  padding: 0 24rpx;
  font-size: 26rpx;
  line-height: 80rpx;
  color: #fff;
  background: #557660;
  border-radius: 40rpx;

  &[disabled] {
    color: #8b8174;
    background: #eee9e1;
  }
}
.compact-button::after,
.visit-button::after {
  border: none;
}
</style>
