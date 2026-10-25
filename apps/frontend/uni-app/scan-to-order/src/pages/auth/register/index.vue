<script setup lang="ts">
import { ClientRoutes } from '@/pages/routes'

definePage({ style: { navigationBarTitleText: '微信登录' } })
onLoad((query) => {
  const redirect = typeof query?.redirect === 'string' ? `?redirect=${encodeURIComponent(query.redirect)}` : ''
  uni.redirectTo({ url: ClientRoutes.Auth.login + redirect })
})
</script>

<template>
  <view />
</template>
