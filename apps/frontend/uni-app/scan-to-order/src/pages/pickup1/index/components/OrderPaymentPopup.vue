<script lang="ts" setup>
/** 本领域订单支付确认弹层。仅负责展示与确认/取消事件，业务由页面 composable 编排。 */
import { t } from '@/locale'

defineProps<{
  /** 是否展示（v-model） */
  modelValue: boolean
  /** 待确认的金额 */
  money: number
  /** 订单号（展示用） */
  orderNo?: string | number | null
}>()

const emit = defineEmits<{
  /** 关闭弹层（v-model） */
  'update:modelValue': [visible: boolean]
  /** 确认支付 */
  'confirm': []
}>()

/** 关闭：遮罩点击、右上角关闭、取消按钮都走这里 */
function onCancel() {
  emit('update:modelValue', false)
}

function onConfirm() {
  emit('update:modelValue', false)
  emit('confirm')
}
</script>

<template>
  <wd-popup
    :model-value="modelValue"
    position="bottom"
    :z-index="2000"
    root-portal
    safe-area-inset-bottom
    custom-style="max-height: 80vh; overflow-y: auto;"
    closable
    custom-class="!rounded-t-32rpx"
    @update:model-value="emit('update:modelValue', $event)"
    @close="onCancel"
  >
    <view class="p-48rpx px-32rpx pb-48rpx">
      <view class="mb-32rpx text-center text-34rpx text-[#333333] font-bold">
        {{ t('orderDetail.order') }}
      </view>
      <view class="mb-32rpx rounded-24rpx bg-[#F7F8FA] p-40rpx text-center">
        <view class="mb-12rpx text-24rpx text-[#999999]">
          {{ t('orderDetail.payable') }}
        </view>
        <view class="flex items-baseline justify-center">
          <text class="mr-8rpx text-32rpx text-[#5D4037] font-bold">¥</text>
          <text class="text-64rpx text-[#5D4037] font-bold font-mono">{{ money }}</text>
        </view>
        <view class="mt-8rpx text-22rpx text-[#999999]">
          {{ t('orderDetail.orderNo') }}：{{ orderNo }}
        </view>
      </view>
      <view class="grid grid-cols-2 gap-24rpx">
        <wd-button

          size="large"
          plain block
          custom-class="!h-88rpx !rounded-44rpx !text-30rpx !text-[#8B4513] !border-2 !border-solid !border-[#8B4513] !bg-white"
          @click="onCancel"
        >
          {{ t('common.cancel') }}
        </wd-button>
        <wd-button
          block
          size="large"
          custom-class="!h-88rpx !rounded-44rpx !text-30rpx !font-semibold !bg-[linear-gradient(135deg,#8B4513_0%,#A0522D_100%)] !text-white !border-none !shadow-[0_8rpx_24rpx_rgba(139,69,19,0.3)]"
          @click="onConfirm"
        >
          {{ t('common.confirm') }}
        </wd-button>
      </view>
    </view>
  </wd-popup>
</template>
