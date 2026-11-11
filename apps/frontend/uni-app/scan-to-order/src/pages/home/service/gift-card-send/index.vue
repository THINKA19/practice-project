<!--
============================================================================
【文件概述】
礼品卡赠送页面入口；装配视图、路由参数及页面生命周期，业务状态由 useGiftSendPage 管理。

【方法与导出清单】
路由页面（不可直接 import）；页面操作委托本领域 composable。

【综合使用示例】
```typescript
import { navigate } from '@/utils/project/navigation'
import { HomeServiceRoutes } from '@/pages/home/service/routes'
void navigate(HomeServiceRoutes.cardSend, { cardId: '7' }) // => 打开页面，参数仍由页面校验
```
============================================================================
-->
<script setup lang="ts">
import SendForm from './components/SendForm/index.vue'
import { useGiftSendPage } from './composables/use-page'

definePage({
  style: {
    navigationBarTitleText: '赠送礼品卡',
  },
})
const vm = useGiftSendPage()
let cardId = ''
onLoad((query) => {
  // 与原实现一致：只允许通过页面按钮分享
  // #ifdef MP-WEIXIN

  uni.hideShareMenu({ hideShareItems: ['shareAppMessage', 'shareTimeline'] })
  // #endif

  cardId = String(query?.cardId || '')
})
onShow(() => {
  void vm.init({ cardId })
})
onShareAppMessage(() => vm.shareAppMessage())
</script>

<template>
  <SendForm :vm="vm" />
</template>
