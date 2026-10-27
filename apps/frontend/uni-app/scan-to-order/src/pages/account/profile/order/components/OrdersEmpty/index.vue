<script setup lang="ts">
defineOptions({ name: 'OrdersEmpty' })
defineProps<{ title: string, desc: string, buttonText: string, loginAction?: boolean }>()
const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <view class="box-border w-full px-48rpx text-center" :class="loginAction ? 'login-empty' : 'py-160rpx'">
    <view class="text-32rpx text-#76583e font-600" :class="loginAction ? '' : 'mt-32rpx'">
      {{ title }}
    </view>
    <view class="mb-48rpx mt-20rpx text-26rpx text-#a1876d">
      {{ desc }}
    </view>
    <wd-button :custom-style="loginAction ? 'background: #169b50; border: 0; color: #fff;' : 'background: #8b7355; border-color: #8b7355; color: #fff;'" @click="emit('action')">
      {{ buttonText }}
    </wd-button>
  </view>
</template>

<style scoped>
.login-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 48rpx;
  padding-bottom: 48rpx;
}
</style>
