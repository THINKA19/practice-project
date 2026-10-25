<script setup lang="ts">
import type { ContactItem } from './models/contact'
import WechatContactPopup from './components/WechatContactPopup.vue'
import { useContactDock } from './composables/useContactDock'
import { t } from '@/locale'

defineProps<{ contacts: ContactItem[], hint?: string }>()
const { expanded, selected, showContact, copy, activate } = useContactDock()
</script>

<template>
  <view class="fixed right-12rpx top-1/2 z-50 flex flex-col items-center gap-12rpx rounded-32rpx bg-white/95 p-12rpx shadow-lg -translate-y-1/2">
    <template v-if="expanded">
      <button v-for="contact in contacts" :key="contact.id" class="contact-button" :style="{ color: contact.color, background: contact.background }" :aria-label="contact.label" @click="activate(contact)">
        <wd-icon :name="contact.icon" size="24px" />
        <text class="contact-label">{{ contact.label }}</text>
      </button>
    </template>
    <button class="contact-button bg-[#f4f5f7] text-[#64748b] !min-h-64rpx" :aria-label="t(expanded ? 'contactDock.collapse' : 'contactDock.expand')" @click="expanded = !expanded">
      <wd-icon :name="expanded ? 'arrow-up' : 'message'" size="20px" />
    </button>
  </view>
  <WechatContactPopup v-model="showContact" :contact="selected" :hint="hint" @copy="copy" />
</template>

<style scoped>
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
.contact-button::after {
  border: 0;
}
.contact-label {
  font-size: 10px;
}
</style>
