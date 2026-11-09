<script setup lang="ts">
import type { ContactItem } from './models/contact'
import WechatContactPopup from './components/WechatContactPopup.vue'
import { useContactDockController } from './composables/use-controller'

defineProps<{ contacts: ContactItem[], hint?: string, directoryLabel?: string }>()
const emit = defineEmits<{ directory: [] }>()
const { selected, showContact, copy, activate } = useContactDockController()
</script>

<template>
  <view class="contact-dock fixed right-12rpx z-50 flex flex-col items-center gap-24rpx">
    <button v-if="directoryLabel" class="contact-directory contact-button bg-white text-[#64748b] shadow-lg" :aria-label="directoryLabel" @click="emit('directory')">
      <wd-icon name="headset" size="22px" />
      <text class="contact-label">{{ directoryLabel }}</text>
    </button>
    <view class="flex flex-col items-center gap-12rpx rounded-32rpx bg-white/95 p-12rpx shadow-lg">
      <button v-for="contact in contacts" :key="contact.id" class="contact-button" :style="{ color: contact.color, background: contact.background }" :aria-label="contact.label" @click="activate(contact)">
        <wd-icon :name="contact.icon" size="24px" />
        <text class="contact-label">{{ contact.label }}</text>
      </button>
    </view>
  </view>
  <WechatContactPopup v-model="showContact" :contact="selected" :hint="hint" @copy="copy" />
</template>

<style scoped>
.contact-dock {
  top: 50%;
  transform: translateY(-50%);
  max-height: 65vh;
  overflow-y: auto;
}
.contact-button {
  display: flex;
  width: 88rpx;
  min-height: 92rpx;
  margin: 0;
  padding: 12rpx 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  border-radius: 22rpx;
  line-height: 1.2;
}
.contact-directory {
  min-height: 80rpx;
}
.contact-button::after {
  border: 0;
}
.contact-label {
  font-size: 10px;
}
</style>
