<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'
import { toast } from '@/utils/project/feedback'

definePage({ style: { navigationBarTitleText: '功能跳转测试' } })

const title = ref('功能测试')
onLoad((query) => {
  title.value = typeof query?.title === 'string' ? query.title : '功能测试'
  uni.setNavigationBarTitle({ title: title.value })
})

function back() {
  uni.navigateBack({
    fail: async () => {
      const result = await navigate(ClientRoutes.Account.my)
      if (!result.ok)
        toast('返回失败，请重试')
    },
  })
}
</script>

<template>
  <view class="min-h-screen bg-#f7f8fa p-40rpx">
    <view class="rounded-24rpx bg-white p-40rpx">
      <text class="text-36rpx font-bold">{{ title }}</text>
      <view class="my-32rpx text-28rpx text-#666">
        跳转成功。这是简单测试页面，当前未接入业务接口，不会提交或修改数据。
      </view>
      <button @tap="back">
        返回我的页面
      </button>
    </view>
  </view>
</template>
