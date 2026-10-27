<script setup lang="ts">
import PolicyView from './components/PolicyView/index.vue'
import { PRIVACY_VERSION, privacyPolicy as sections } from './models/enums'

definePage({ style: { navigationBarTitleText: '隐私协议', disableScroll: true } })
</script>

<template>
  <z-paging fixed :auto="false" :use-page-scroll="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false" :paging-style="{ background: '#fffaf7' }">
    <PolicyView title="隐私协议" :version="PRIVACY_VERSION" :sections="sections" />
  </z-paging>
</template>
