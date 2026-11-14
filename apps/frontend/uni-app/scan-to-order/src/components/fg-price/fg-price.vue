<script setup lang="ts">
import { computed } from 'vue'
import { currentLocale } from '@/locale'
import { formatSettlementPrice, orderingCurrency } from '@/utils/project/price'

const props = defineProps<{
  amount: number | string | null | undefined
  countryCode?: string
  currencyCode?: string
  amountUnit?: 'settlement'
  showCurrencyName?: boolean
}>()

const settlementText = computed(() => formatSettlementPrice(props.amount, props.currencyCode))
const currency = computed(() => orderingCurrency(props.countryCode, currentLocale.value))
</script>

<template>
  <text>
    <template v-if="amountUnit === 'settlement'">{{ settlementText }}</template>
    <template v-else>
      {{ currency.symbol }}{{ amount ?? '' }}{{ currency.unit }}<text v-if="showCurrencyName && currency.name" class="ml-4rpx text-20rpx font-normal">{{ currency.name }}</text>
    </template>
  </text>
</template>
