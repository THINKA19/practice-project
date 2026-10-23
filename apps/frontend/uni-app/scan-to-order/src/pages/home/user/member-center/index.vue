<!--
============================================================================
【文件概述】首页用户分类下的会员中心跳转测试页，不接入业务数据。
【方法与导出清单】默认页面组件；definePage 声明原生导航标题。
【综合使用示例】
import { ClientRoutes } from '@/pages/routes'
uni.navigateTo({ url: ClientRoutes.Home.memberCenter }) // 显示本测试页
============================================================================
-->
<script setup lang="ts">
definePage({
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '会员中心',
  },
})
</script>

<template>
  <view class="p-6">
    <view class="text-xl font-bold">
      会员中心
    </view>
    <view class="mt-4 text-gray-500">
      已进入会员中心测试页面。
    </view>
  </view>
</template>
