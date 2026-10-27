<script setup lang="ts">
import PolicyView from './components/PolicyView/index.vue'
import { AGREEMENT_VERSION, userAgreement as sections } from './models/enums'

definePage({ style: { navigationBarTitleText: '用户协议', disableScroll: true } })
</script>

<template>
  <z-paging fixed :auto="false" :use-page-scroll="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false" :paging-style="{ background: '#fffaf7' }">
    <PolicyView title="用户协议" :version="AGREEMENT_VERSION" :sections="sections" />
  </z-paging>
</template>
