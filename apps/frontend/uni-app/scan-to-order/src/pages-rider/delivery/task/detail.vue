<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import PhoneContact from '@/components/phone-contact/index.vue'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import { t } from '@/locale'
import { useRiderCopyAddress } from './composables/use-copy-address'
import { deliveredAt, deliveryDeadlineLabel, formatRiderTime } from './domain/task.rules'
import { useRiderTaskDetail } from './composables/use-detail'

definePage({ style: { navigationBarTitleText: '配送任务详情' } })
const { store, task, report, onCancel, resolveShopPhone, resolveCustomerPhone, navigateTask, acceptAssigned, rejectAssigned, pickupOrder, finishOrder } = useRiderTaskDetail()
const copyAddress = useRiderCopyAddress('rider-task-detail-address')
const active = computed(() => task.value?.status === 'accepted' || task.value?.status === 'delivering')
const canAct = computed(() => active.value || task.value?.status === 'assigned')

const stops = computed(() => {
  const order = task.value
  if (!order)
    return []
  const waiting = order.status === 'pending' || order.status === 'assigned'
  const pickup = {
    key: 'pickup',
    title: order.shopName,
    address: order.shopAddress,
    note: order.status === 'accepted' ? order.pickupNote : undefined,
  }
  const dropoff = {
    key: 'dropoff',
    title: '',
    address: waiting ? order.deliveryArea?.trim() || t('rider.task.addressAfterAccept') : order.address,
    note: order.status === 'delivering' ? order.deliveryNote : undefined,
  }
  return order.status === 'delivering' ? [dropoff, pickup] : [pickup, dropoff]
})

const timeline = computed(() => {
  const order = task.value
  if (!order)
    return []
  return [
    { key: 'createdAt', time: order.createdAt },
    { key: 'acceptedAt', time: order.acceptAt },
    { key: 'pickedUpAt', time: order.pickedUpAt },
    { key: 'deliveredAt', time: order.status === 'done' ? deliveredAt(order) : undefined },
    { key: 'cancelledAt', time: order.status === 'cancelled' ? order.cancelledAt : undefined },
  ].filter(item => item.time)
})

onShow(() => uni.setNavigationBarTitle({ title: t('rider.task.detailTitle') }))
</script>

<template>
  <view class="mx-auto box-border max-w-1120px min-h-screen w-full bg-[#FFF8F1] p-16px" :class="{ 'has-actions': canAct }">
    <wd-toast selector="rider-task-detail-address" />
    <view v-if="store.error" class="mb-12px flex items-center justify-between gap-8px text-red-700">
      <text>{{ store.error }}</text>
      <wd-button plain size="small" :disabled="store.loading" @click="store.refresh">
        {{ t('rider.task.refresh') }}
      </wd-button>
    </view>
    <view v-if="task" class="grid grid-cols-1 gap-12px md:grid-cols-2">
      <view class="min-w-0 rounded-12px bg-white p-16px md:col-span-2">
        <view class="flex flex-wrap items-center justify-between gap-8px">
          <text class="text-20px font-bold">{{ t(`rider.task.${task.status}`) }}</text>
          <text v-if="task.status !== 'cancelled'" class="text-[var(--app-brand-primary)] font-semibold">
            {{ t(task.status === 'done' ? 'rider.task.fee' : 'rider.task.estimatedFee') }} <FgPrice :amount="task.serviceArea?.currency ? task.deliveryFee : undefined" :currency-code="task.serviceArea?.currency" amount-unit="settlement" />
          </text>
        </view>
        <text class="mt-8px block break-all text-14px text-[var(--app-text-muted)]">{{ t('rider.task.orderNumber', { id: task.orderId }) }}</text>
        <view class="mt-8px flex flex-wrap gap-x-16px gap-y-4px text-14px text-[var(--app-text-muted)]">
          <text>{{ t('rider.task.orderAmount') }} <FgPrice :amount="task.serviceArea?.currency ? task.amount : undefined" :currency-code="task.serviceArea?.currency" amount-unit="settlement" /></text>
          <text v-if="task.serviceArea">{{ task.serviceArea.label }}</text>
        </view>
        <view v-if="active" class="mt-8px flex flex-wrap justify-end gap-8px">
          <wd-button v-if="task.status === 'accepted'" plain size="small" :disabled="store.submitting" @click="onCancel(task)">
            {{ t('rider.task.release') }}
          </wd-button>
          <wd-button plain size="small" :disabled="store.submitting" @click="report">
            {{ t('rider.task.reportIssue') }}
          </wd-button>
        </view>
      </view>

      <view class="min-w-0 rounded-12px bg-white p-16px">
        <view v-for="(stop, index) in stops" :key="stop.key" :class="{ 'mt-12px border-t border-gray-100 pt-12px': index > 0 }">
          <text class="block text-13px text-[var(--app-text-muted)]">{{ t(stop.key === 'pickup' ? 'rider.task.pickupAddress' : 'rider.task.deliveryAddress') }}</text>
          <text v-if="stop.title" class="mt-4px block break-words font-semibold">{{ stop.title }}</text>
          <text v-if="stop.address" class="mt-4px block break-words text-14px font-semibold">{{ stop.address }}</text>
          <text v-if="stop.key === 'dropoff' && task.status === 'delivering' && task.customer" class="mt-4px block break-words text-14px">{{ task.customer }}</text>
          <text v-if="stop.note?.trim()" class="mt-4px block break-words text-14px text-[var(--app-text-muted)]">
            {{ t(stop.key === 'pickup' ? 'rider.task.pickupNote' : 'rider.task.deliveryNote', { note: stop.note }) }}
          </text>
          <text v-if="stop.key === 'pickup' && task.status === 'accepted' && task.pickupCode" class="mt-8px block text-20px text-[var(--app-brand-primary)] font-bold">
            {{ t('rider.task.pickupCode', { code: task.pickupCode }) }}
          </text>
          <text v-if="stop.key === 'dropoff' && task.deliverBy && task.status !== 'done' && task.status !== 'cancelled'" class="mt-4px block text-14px text-[var(--app-brand-primary)]">
            {{ t('rider.task.deliverBy', { time: formatRiderTime(task.deliverBy, task.serviceArea?.timeZone) }) }}
          </text>
          <view v-if="stop.key === 'dropoff' && task.status === 'delivering'" class="mt-4px flex flex-wrap gap-8px text-14px font-semibold">
            <text v-if="task.deliveryDistanceKm !== undefined">{{ t('rider.task.deliveryDistance', { distance: task.deliveryDistanceKm.toFixed(1) }) }}</text>
            <text v-if="task.deliverBy" :class="Date.parse(task.deliverBy) < store.clock ? 'text-red-700' : 'text-[var(--app-brand-primary)]'">
              {{ deliveryDeadlineLabel(task, store.clock) }}
            </text>
          </view>
          <view v-if="index === 0 && active" class="mt-8px flex flex-wrap gap-8px">
            <PhoneContact :key="task.version" :resolve-phone="() => task && (task.status === 'accepted' ? resolveShopPhone(task) : resolveCustomerPhone(task))">
              <template #trigger="{ open }">
                <wd-button plain size="small" @click="open">
                  {{ t(task.status === 'accepted' ? 'rider.task.callShop' : 'rider.task.callCustomer') }}
                </wd-button>
              </template>
            </PhoneContact>
            <wd-button plain size="small" @click="navigateTask(task)">
              {{ t(task.status === 'accepted' ? 'rider.task.navigatePickup' : 'rider.task.navigateDelivery') }}
            </wd-button>
            <wd-button v-if="stop.address.trim()" plain size="small" @click="copyAddress(stop.address)">
              {{ t('rider.task.copyAddress') }}
            </wd-button>
          </view>
        </view>
      </view>

      <view v-if="task.goodsSummary || task.itemCount !== undefined" class="min-w-0 rounded-12px bg-white p-16px">
        <text class="mb-8px block font-semibold">{{ t('rider.task.goods') }}</text>
        <text v-if="task.goodsSummary" class="block">{{ task.goodsSummary }}</text>
        <text v-if="task.itemCount !== undefined" class="block">{{ t('rider.task.itemCount', { count: task.itemCount }) }}</text>
      </view>

      <view v-if="timeline.length || task.exception" class="min-w-0 rounded-12px bg-white p-16px md:col-span-2">
        <text class="mb-8px block font-semibold">{{ t('rider.task.timeline') }}</text>
        <view v-for="entry in timeline" :key="entry.key" class="flex flex-wrap justify-between gap-8px py-4px text-14px">
          <text>{{ t(`rider.task.${entry.key}`) }}</text>
          <text>{{ formatRiderTime(entry.time, task.serviceArea?.timeZone) }}</text>
        </view>
        <text v-if="task.exception" class="mt-8px block break-words text-14px">{{ t('rider.task.exceptionRecorded', { detail: task.exception }) }}</text>
      </view>

      <view v-if="canAct" class="detail-actions fixed bottom-0 left-0 right-0 z-10 mx-auto box-border max-w-1120px w-full border-t border-gray-100 bg-white px-16px pt-12px">
        <view v-if="task.status === 'assigned'" class="grid grid-cols-[1fr_2fr] gap-8px">
          <wd-button plain block :disabled="store.submitting" @click="rejectAssigned(task)">
            {{ t('rider.task.rejectTitle') }}
          </wd-button>
          <wd-button block :disabled="store.submitting || !store.online" @click="acceptAssigned(task)">
            {{ t('rider.task.accept') }}
          </wd-button>
        </view>
        <wd-button v-else-if="task.status === 'accepted'" block :disabled="store.submitting" @click="pickupOrder(task)">
          {{ t('rider.task.confirmPickup') }}
        </wd-button>
        <wd-button v-else block :disabled="store.submitting" @click="finishOrder(task)">
          {{ t('rider.task.confirmDelivery') }}
        </wd-button>
      </view>
    </view>
    <PageLoading v-else-if="store.loading && !store.error" :title="t('rider.task.loading')" />
    <text v-else-if="!store.error">{{ t('rider.task.missing') }}</text>
  </view>
</template>

<style scoped>
.has-actions {
  padding-bottom: calc(84px + env(safe-area-inset-bottom));
}

.detail-actions {
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}
</style>
