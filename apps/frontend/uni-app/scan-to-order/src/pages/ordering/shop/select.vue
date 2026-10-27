<!--
【文件概述】点餐模块选店跳转测试页，仅展示首页传入的配送方式，不请求业务数据。
【方法与导出清单】默认页面组件；onLoad 校验 peisongType 查询参数。
【综合使用示例】navigate(ClientRoutes.Ordering.shopSelect, { peisongType: 'zq' })
-->
<script setup lang="ts">
import { useShopSelectView } from './composables/use-view'

definePage({
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '选店跳转测试',
  },
})

const { t, deliveryType } = useShopSelectView()
</script>

<template>
  <view class="p-6">
    <view class="text-xl font-bold">
      选店跳转测试
    </view>
    <view class="mt-4 text-gray-500">
      已进入选店测试页面。
    </view>
    <view class="mt-4">
      <template v-if="deliveryType">
        {{ t('home.delivery.title') }}：{{ t(deliveryType === 'zq' ? 'home.delivery.pickup' : 'home.delivery.takeout') }}
      </template>
      <template v-else>
        未提供有效配送方式，请从首页的到店自取或外卖配送入口进入。
      </template>
    </view>
  </view>
</template>
