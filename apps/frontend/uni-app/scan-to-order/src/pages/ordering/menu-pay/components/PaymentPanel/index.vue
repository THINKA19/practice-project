<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】结算与支付 / components/PaymentPanel/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import PaymentPanel from '@/pages/ordering/menu-pay/components/PaymentPanel/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import { PlatformError, useOrderingLocale as useI18n } from '@/pages/ordering/menu'
/**
 * 收银台弹层（原 components/payment）
 * 纯 UI + 调用 payment 上下文的 pay() 应用服务，不含其他业务
 *
 * 用法：
 * <PaymentPanel v-model="show" :money="money" :remark="remark" :next-action="{ type: 0, id }" @ok="onPaid" />
 */
import type { NextAction, PayChannel } from '../../models/payment.types'
import { orderingSettings } from '@/pages/ordering/index/index'
import { usePayActions } from '../../composables/use-actions'
import { showError, toast } from '@/utils/project/interaction'

const props = withDefaults(defineProps<{
  modelValue: boolean
  money: number
  countryCode?: string
  remark: string
  nextAction?: NextAction
  extData?: Record<string, string | number>
}>(), {
  nextAction: undefined,
  extData: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'ok': []
  'cancel': []
}>()

const { countryCode: shopCountryCode } = useOrderingCurrency()

const { pay } = usePayActions()
const { t } = useI18n()

const channel = ref<PayChannel>('wx')
const alipayQrcode = ref('')
const submitting = ref(false)
const alipayEnabled = computed(() => (orderingSettings.alipay ?? '') === '1')

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

watch(() => props.modelValue, (v) => {
  if (v) {
    alipayQrcode.value = ''
  }
})

function choose(c: PayChannel) {
  channel.value = c
  alipayQrcode.value = ''
}

function close() {
  visible.value = false
  emit('cancel')
}

async function submit() {
  if (submitting.value) {
    return
  }
  submitting.value = true
  try {
    const outcome = await pay({
      money: props.money,
      remark: props.remark,
      nextAction: props.nextAction,
      extData: props.extData,
    }, channel.value)
    if (outcome.channel === 'alipay') {
      alipayQrcode.value = outcome.qrcodeImage
      return
    }
    toast(t('asset.success'), 'success')
    visible.value = false
    emit('ok')
  }
  catch (e) {
    if (!(e instanceof PlatformError && e.reason === 'Cancelled'))
      showError(e)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <wd-popup v-model="visible" position="bottom" round closable safe-area-inset-bottom @close="close">
    <view class="px-32rpx pb-32rpx pt-48rpx">
      <view class="text-center text-28rpx text-gray-600">
        {{ remark }}
      </view>
      <view class="my-16rpx text-center text-56rpx text-#c93636 font-bold">
        <FgPrice :amount="money" :country-code="countryCode ?? shopCountryCode" show-currency-name />
      </view>
      <wd-divider>{{ t('payment.select') }}</wd-divider>
      <view class="pay-item" @tap="choose('wx')">
        <image class="h-48rpx w-48rpx" src="https://dcdn.it120.cc/2024/08/29/b327bac1-bfe6-4083-8c56-e2628a7273df.png" />
        <text class="ml-16rpx flex-1">
          {{ t('payment.wx') }}
        </text>
        <wd-icon :name="channel === 'wx' ? 'check-circle-fill' : 'uncheck-circle'" :color="channel === 'wx' ? '#e64340' : '#ccc'" size="22px" />
      </view>
      <view v-if="alipayEnabled" class="pay-item" @tap="choose('alipay')">
        <image class="h-48rpx w-48rpx" src="https://dcdn.it120.cc/2024/08/29/b6fdcdd9-bb24-46fd-b066-1a41c0ea8047.png" />
        <text class="ml-16rpx flex-1">
          {{ t('payment.alipay') }}
        </text>
        <wd-icon :name="channel === 'alipay' ? 'check-circle-fill' : 'uncheck-circle'" :color="channel === 'alipay' ? '#e64340' : '#ccc'" size="22px" />
      </view>
      <block v-if="alipayQrcode">
        <image :src="alipayQrcode" mode="widthFix" class="mx-auto mt-24rpx block w-480rpx" show-menu-by-longpress />
        <view class="mt-16rpx text-center text-24rpx text-gray-500">
          {{ t('payment.alipayQrcodeText') }}
        </view>
      </block>
      <view v-else class="mt-48rpx">
        <wd-button type="danger" round block :disabled="submitting" @click="submit">
          <PageLoading v-if="submitting" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
          {{ t('order.toPayTap') }}
        </wd-button>
      </view>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
.pay-item {
  display: flex;
  align-items: center;
  padding: 24rpx 8rpx;
  border-bottom: 1rpx solid #f2f2f2;
}
</style>
