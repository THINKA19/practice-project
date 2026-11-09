<script setup lang="ts">
defineOptions({ name: 'AuthPageShell' })
defineProps<{ title: string }>()
</script>

<template>
  <z-paging fixed :auto="false" :use-page-scroll="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false" :paging-style="{ background: '#edf5ef' }">
    <view class="auth-stage">
      <view class="auth-card">
        <text class="auth-heading">{{ title }}</text>
        <slot />
      </view>
    </view>
  </z-paging>
</template>

<style scoped>
.auth-stage {
  box-sizing: border-box;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: clamp(32px, 9vh, 112px) 20px 40px;
  background: linear-gradient(155deg, #dfefe4 0%, #f4f8f3 58%, #eaf2ec 100%);
}
.auth-card {
  box-sizing: border-box;
  width: 100%;
  max-width: 450px;
  padding: clamp(22px, 6vw, 36px);
  border: 1px solid #d7e7db;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 16px 44px rgb(24 65 44 / 9%);
}
.auth-heading {
  display: block;
  margin-bottom: 26px;
  color: #536760;
  font-size: 15px;
  text-align: center;
}
</style>
