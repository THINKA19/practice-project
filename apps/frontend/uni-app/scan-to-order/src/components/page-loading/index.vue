<script setup lang="ts">
import WdLoading from '@wot-ui/ui/components/wd-loading/wd-loading.vue'
import { t } from '@/locale'

defineProps<{
  title?: string
  inline?: boolean
  overlay?: boolean
  refreshStatus?: string
  indicatorOnly?: boolean
  size?: string
  color?: string
}>()

const refreshLabels: Record<string, string> = {
  'default': 'common.pullToRefresh',
  'release-to-refresh': 'common.releaseToRefresh',
  'complete': 'common.refreshComplete',
}
</script>

<template>
  <view class="page-loading" :class="{ 'page-loading--inline': inline, 'page-loading--overlay': overlay }" role="status" :aria-label="refreshStatus && refreshStatus !== 'loading' ? undefined : title || t('common.loading')">
    <text v-if="refreshStatus && refreshStatus !== 'loading'">{{ t(refreshLabels[refreshStatus] || refreshLabels.default) }}</text>
    <WdLoading v-else type="dots" :direction="inline ? 'horizontal' : 'vertical'" :size="size" :color="color" custom-style="--wot-loading-color-main: #b47b55; --wot-loading-color-text: #806b5b" :text="indicatorOnly ? '' : title || t('common.loading')" />
  </view>
</template>

<style scoped>
.page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-loading--inline {
  display: inline-flex;
  vertical-align: middle;
}
.page-loading--overlay {
  position: fixed;
  z-index: 999;
  inset: 0;
  background: rgb(255 255 255 / 72%);
}
</style>
