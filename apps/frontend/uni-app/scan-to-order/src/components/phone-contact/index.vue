<script setup lang="ts">
import PhoneDialog from './PhoneDialog.vue'
import { usePhoneContact } from './use-phone-contact'

defineOptions({ name: 'PhoneContact', options: { virtualHost: true } })

const props = withDefaults(defineProps<{
  phone?: string
  resolvePhone?: () => string | undefined | void | Promise<string | undefined | void>
  copyOnDialFailure?: boolean
  label?: string
  title?: string
  description?: string
  unavailableMessage?: string
}>(), {
  label: '电话',
  title: '联系电话',
  description: '请复制电话号码后使用手机拨打。',
  unavailableMessage: '暂未提供联系电话',
})

defineSlots<{ trigger?: (props: { open: () => void, available: boolean }) => unknown }>()

const { phone, visible, message, copying, successVisible, open: openContact, close, copy } = usePhoneContact(
  () => props.phone,
  () => props.unavailableMessage,
  () => props.copyOnDialFailure,
)

function open() {
  return openContact(props.resolvePhone)
}
</script>

<template>
  <slot name="trigger" :open="open" :available="!!props.resolvePhone || !!props.phone?.trim()">
    <button @tap.stop="open">
      <wd-icon name="phone" size="32rpx" />
      <text>{{ label }}</text>
    </button>
  </slot>
  <PhoneDialog
    :model-value="visible"
    :phone="phone"
    :title="title"
    :description="description"
    :message="message"
    :copying="copying"
    :success-visible="successVisible"
    @update:model-value="close"
    @copy="copy"
  />
</template>
