<!--
============================================================================
【文件概述】
礼品卡领取页面入口；装配视图、路由参数及页面生命周期，业务状态由 useGiftReceivePage 管理。

【方法与导出清单】
路由页面（不可直接 import）；页面操作委托本领域 composable。

【综合使用示例】
```typescript
import { navigate } from '@/utils/project/navigation'
import { HomeServiceRoutes } from '@/pages/home/service/routes'
void navigate(HomeServiceRoutes.cardReceive, { id: '7', shareToken: 'example-token' }) // => 打开页面，参数仍由页面校验
```
============================================================================
-->
<script setup lang="ts">
import ReceiveCard from './components/ReceiveCard/index.vue'
import { useGiftReceivePage } from './composables/use-page'
import { ref } from 'vue'
// #ifdef H5
import { parseGiftReceiveUrl } from '../routes'
// #endif

definePage({
  style: {
    navigationBarTitleText: '领取礼品卡',
  },
})

const vm = useGiftReceivePage()
const shareQuery = ref<{ id?: string, shareToken?: string }>({})

// #ifdef H5
const pastedLink = ref('')
const linkError = ref('')
const openingLink = ref(false)

function openGiftLink() {
  let path: string | null = null
  try {
    path = parseGiftReceiveUrl(pastedLink.value, window.location.href, import.meta.env.VITE_APP_ROUTER_MODE, import.meta.env.VITE_APP_PUBLIC_BASE)
  }
  catch {
    // 粘贴的内容可能不是 URL。
  }
  if (!path) {
    linkError.value = '请输入本站完整的礼品卡领取链接'
    return
  }
  linkError.value = ''
  openingLink.value = true
  uni.redirectTo({
    url: path,
    fail: () => { linkError.value = '暂时无法打开领取链接，请重试' },
    complete: () => { openingLink.value = false },
  })
}
// #endif

onLoad((query) => {
  shareQuery.value = { id: query?.id, shareToken: query?.shareToken }
})
onShow(() => vm.init(shareQuery.value))
</script>

<template>
  <view v-if="!shareQuery.id && !shareQuery.shareToken" class="receive-entry">
    <view class="receive-panel">
      <view class="mb-16rpx text-36rpx text-#4f3528 font-600">
        领取好友赠送
      </view>
      <!-- #ifdef H5 -->
      <view class="mb-24rpx text-28rpx text-#6f594c leading-relaxed">
        粘贴好友发来的完整链接，预览后确认领取。
      </view>
      <textarea
        v-model="pastedLink" class="receive-input" :class="{ 'receive-input-error': linkError }"
        :maxlength="-1" aria-label="领取链接" placeholder="粘贴领取链接" @input="linkError = ''"
      />
      <view v-if="linkError" class="mt-12rpx text-26rpx text-#923d31" role="alert">
        {{ linkError }}
      </view>
      <wd-button
        class="mt-24rpx" custom-class="receive-link-button" block :disabled="openingLink || !pastedLink.trim()"
        :loading="openingLink" @click="openGiftLink()"
      >
        查看待领取礼品卡
      </wd-button>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <view class="text-28rpx text-#6f594c leading-relaxed">
        在微信聊天中打开好友发来的礼品卡消息，预览后点击「确认领取」。
      </view>
      <!-- #endif -->
    </view>
  </view>
  <ReceiveCard v-else :vm="vm" />
</template>

<style scoped>
.receive-entry {
  box-sizing: border-box;
  width: 100%;
  min-height: calc(100vh - var(--window-top, 0px) - var(--window-bottom, 0px));
  padding: 32rpx 24rpx calc(32rpx + env(safe-area-inset-bottom));
  background: #fff;
}
.receive-panel {
  width: 100%;
}
.receive-input {
  box-sizing: border-box;
  width: 100%;
  height: 168rpx;
  padding: 20rpx;
  color: #4f3528;
  background: #fcfaf7;
  border: 2rpx solid #d7c4b4;
  border-radius: 16rpx;
}
.receive-input-error {
  border-color: #b96f60;
}
:deep(.receive-link-button) {
  color: #fff;
  background: #754e37;
  border-color: #754e37;
}
</style>
