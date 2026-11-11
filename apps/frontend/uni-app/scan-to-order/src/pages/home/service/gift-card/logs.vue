<!--
============================================================================
【文件概述】历史礼品卡页面地址的兼容入口。
【方法与导出清单】默认页面组件，保留旧链接的参数。
【综合使用示例】
import { ClientRoutes } from '@/pages/routes'
uni.navigateTo({ url: ClientRoutes.Home.cardLogs })
============================================================================
-->
<script setup lang="ts">
import { HomeServiceRoutes } from '../routes'

onLoad((query) => {
  const params: string[] = []
  if (typeof query?.cardId === 'string')
    params.push(`cardId=${encodeURIComponent(query.cardId)}`)
  const suffix = params.length ? `?${params.join('&')}` : ''
  uni.redirectTo({ url: HomeServiceRoutes.cardLogs + suffix })
})
</script>

<template>
  <view />
</template>
