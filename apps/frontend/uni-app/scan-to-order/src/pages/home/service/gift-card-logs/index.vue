<!--
============================================================================
【文件概述】
礼品卡记录页面入口；装配视图、路由参数及页面生命周期，业务状态由 useCardLogsPage 管理。

【方法与导出清单】
路由页面（不可直接 import）；页面操作委托本领域 composable。

【综合使用示例】
```typescript
import { navigate } from '@/utils/project/navigation'
import { HomeServiceRoutes } from '@/pages/home/service/routes'
void navigate(HomeServiceRoutes.cardLogs, { cardId: '7' }) // => 打开页面，参数仍由页面校验
```
============================================================================
-->
<script setup lang="ts">
import LogList from './components/LogList/index.vue'
import { useCardLogsPage } from './composables/use-page'
import { ref } from 'vue'

definePage({
  style: {
    navigationBarTitleText: '礼品卡详情',
    backgroundColor: '#f5f0eb',
    enablePullDownRefresh: true,
  },
})
const vm = useCardLogsPage()
let cardId = ''
const section = ref<'details' | 'records'>('records')
onLoad((query) => {
  cardId = String(query?.cardId || '')
  section.value = query?.section === 'details' ? 'details' : 'records'
})
onShow(() => void vm.init({ cardId }))
onPullDownRefresh(async () => {
  await vm.refresh()

  uni.stopPullDownRefresh()
})
onReachBottom(() => {
  if (section.value === 'records' && vm.hasMore.value && !vm.failed.value)
    void vm.loadMore()
})
</script>

<template>
  <LogList v-model:section="section" :vm="vm" />
</template>
