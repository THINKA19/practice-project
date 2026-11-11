<!--
============================================================================
【文件概述】
礼品卡兑换页面入口；装配视图、路由参数及页面生命周期，业务状态由 useCardExchangePage 管理。

【方法与导出清单】
路由页面（不可直接 import）；页面操作委托本领域 composable。

【综合使用示例】
```typescript
import { navigate } from '@/utils/project/navigation'
import { HomeServiceRoutes } from '@/pages/home/service/routes'
void navigate(HomeServiceRoutes.cardExchange) // => 打开页面，参数仍由页面校验
```
============================================================================
-->
<script setup lang="ts">
import ExchangeForm from './components/ExchangeForm/index.vue'
import { useCardExchangePage } from './composables/use-page'

definePage({
  style: {
    navigationBarTitleText: '礼品卡兑换',
  },
})

const vm = useCardExchangePage()

onLoad(() => {
  vm.init()
})
</script>

<template>
  <ExchangeForm :vm="vm" />
</template>
