<script setup lang="ts">
import MemberOverview from './components/MemberOverview/index.vue'
import { useMemberCenterPage } from './composables/use-page'

definePage({ style: { navigationBarTitleText: '会员中心', enablePullDownRefresh: true } })
const vm = useMemberCenterPage()
onShow(() => {
  void vm.refresh()
})
onPullDownRefresh(async () => {
  try {
    await vm.refresh()
  }
  finally {
    uni.stopPullDownRefresh()
  }
})
</script>

<template>
  <MemberOverview :vm="vm" />
</template>
