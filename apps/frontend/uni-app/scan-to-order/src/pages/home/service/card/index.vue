<!--
============================================================================
【文件概述】首页服务分类下的会员卡／礼品卡跳转测试页，不接入业务数据。
【方法与导出清单】默认页面组件；definePage 声明原生导航标题。
【综合使用示例】
import { ClientRoutes } from '@/pages/routes'
uni.navigateTo({ url: ClientRoutes.Home.card }) // 显示本测试页
============================================================================
-->
<script setup lang="ts">
definePage({
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '会员卡／礼品卡',
  },
})
</script>

<template>
  <view class="p-6">
    <view class="text-xl font-bold">
      会员卡／礼品卡
    </view>
    <view class="mt-4 text-gray-500">
      已进入会员卡／礼品卡测试页面。
    </view>
  </view>
</template>
