<script setup lang="ts">
import { t } from '@/locale'

defineOptions({ name: 'AgreementConsent' })

defineProps<{ disabled?: boolean }>()
const emit = defineEmits<{ readUser: [], readPrivacy: [] }>()
const agreed = defineModel<boolean>({ default: false })
</script>

<template>
  <view class="mt-32rpx flex flex-wrap items-center gap-12rpx text-26rpx text-[#333333]">
    <wd-checkbox v-model="agreed" :disabled="disabled" style="--wot-checkbox-label-color: #333333;">
      {{ t('auth.agree') }}
    </wd-checkbox>
    <text class="text-[#8b4513]" @click="emit('readUser')">{{ t('auth.userAgreement') }}</text>
    <text class="text-[#333333]">{{ t('auth.and') }}</text>
    <text class="text-[#8b4513]" @click="emit('readPrivacy')">{{ t('auth.privacyAgreement') }}</text>
  </view>
</template>
