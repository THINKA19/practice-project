<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{ disabled: boolean }>()

const { t } = useI18n()

function showPasswordHelp() {
  uni.showModal({
    title: t('common.passwordHelpTitle'),
    content: t('common.passwordResetHelp'),
    confirmText: t('common.confirm'),
    showCancel: false,
  })
}
</script>

<template>
  <view class="mb-8px flex justify-end">
    <wd-button variant="text" :disabled="disabled" @click="showPasswordHelp">
      {{ t('common.forgotPassword') }}
    </wd-button>
  </view>
</template>
