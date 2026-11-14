<script setup lang="ts">
import WdEmpty from '@wot-ui/ui/components/wd-empty/wd-empty.vue'
import PageLoading from '@/components/page-loading/index.vue'

defineOptions({ name: 'PageState' })

defineProps<PageStateProps>()

/** 统一页面状态展示；请求、业务操作及按钮样式由调用页面负责。 */
interface PageStateProps {
  status: 'loading' | 'empty' | 'error'
  title: string
  description?: string
  compact?: boolean
  fill?: boolean
}
</script>

<template>
  <view class="box-border flex flex-col items-center justify-center px-40rpx py-48rpx" :class="fill ? 'min-h-0 flex-1' : compact ? 'min-h-240rpx' : 'min-h-[calc(100vh-var(--window-top,0px)-var(--window-bottom,0px)-300rpx)]'">
    <PageLoading v-if="status === 'loading'" />
    <WdEmpty v-else :tip="title">
      <template #bottom>
        <view v-if="description" class="mt-16rpx max-w-560rpx text-center text-26rpx text-[#999] leading-42rpx">
          {{ description }}
        </view>
        <view v-if="$slots.default" class="mt-40rpx">
          <slot />
        </view>
      </template>
    </WdEmpty>
  </view>
</template>
