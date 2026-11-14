<!-- 骑手实时任务、运营范围与接单状态。 -->
<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import PhoneContact from '@/components/phone-contact/index.vue'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { getTemplateByKey, t } from '@/locale'
import { homeCountry, marketCountryName } from '@/locale/market'
import { toast } from '@/utils/project/interaction'
import { navigate as go } from '@/utils/project/navigation'
import { RiderRoutes } from '@/pages-rider/routes'
import { deliveryDeadlineLabel, maskRiderPhone, riderIncomeAmounts, useRiderCopyAddress } from '@/pages-rider/delivery/task'
import { useRiderWorkspacePage } from './composables/use-page'

defineOptions({ name: 'RiderWorkbench' })
definePage({ style: { navigationBarTitleText: '骑手工作台', navigationStyle: 'custom', enablePullDownRefresh: true } })

const {
  online,
  loading,
  submitting,
  hallOrders,
  activeOrders,
  assignedOrders,
  stats,
  serviceArea,
  maxConcurrent,
  announcement,
  overviewError,
  refreshOverview,
  toggleOnline,
  refresh,
  onGrab,
  onPickup,
  onFinish,
  resolveCustomerPhone,
  resolveShopPhone,
  navigateTask,
  acceptAssigned,
  rejectAssigned,
  error,
  goBackClient,
  latest,
  reminderEnabled,
  toggleReminder,
} = useRiderWorkspacePage()

const copyAddress = useRiderCopyAddress('rider-workspace-address')
const now = ref(Date.now())
const notifiedAssignments = new Set<string>()
let countdown: ReturnType<typeof setInterval> | undefined

function remainingSeconds(expiresAt?: string) {
  return expiresAt ? Math.max(0, Math.ceil((Date.parse(expiresAt) - now.value) / 1000)) : undefined
}

function assignmentCountdown(expiresAt: string) {
  const seconds = remainingSeconds(expiresAt) ?? 0
  return [Math.floor(seconds / 60), seconds % 60].map(value => String(value).padStart(2, '0')).join(':')
}

function updateCountdown() {
  now.value = Date.now()
  const expired = assignedOrders.value.filter(order => remainingSeconds(order.assignmentExpiresAt) === 0)
  const keys = new Set(expired.map(order => JSON.stringify([order.riderId, order.id, order.assignmentExpiresAt])))
  for (const key of notifiedAssignments) {
    if (!keys.has(key))
      notifiedAssignments.delete(key)
  }
  if (!online.value || ![...keys].some(key => !notifiedAssignments.has(key)))
    return
  keys.forEach(key => notifiedAssignments.add(key))
  toast(t('rider.task.expired'))
  if (!submitting.value && !loading.value)
    void refresh()
}

function stopCountdown() {
  clearInterval(countdown)
  countdown = undefined
}

onShow(() => {
  stopCountdown()
  updateCountdown()
  countdown = setInterval(updateCountdown, 1000)
})
onHide(stopCountdown)
onUnload(stopCountdown)
onScopeDispose(stopCountdown)

const serviceAreaLabel = computed(() => {
  const area = serviceArea.value
  if (!area)
    return t(area === null ? 'rider.workspace.areaMissing' : 'rider.workspace.areaPending')
  const key = `rider.workspace.zone${area.countryCode}.${area.zoneId}`
  const zone = getTemplateByKey(key)
  return zone === key ? area.label : `${marketCountryName(area.countryCode)} / ${zone}`
})

const stage = ref<'new' | 'pickup' | 'delivery'>('new')
const pendingAssignments = computed(() => online.value
  ? assignedOrders.value.filter(order => remainingSeconds(order.assignmentExpiresAt) !== 0)
  : [])
const stages = computed(() => ({
  new: {
    label: t('rider.workspace.new'),
    orders: online.value ? hallOrders.value : [],
    empty: serviceArea.value === null
      ? t('rider.workspace.areaHelp')
      : online.value ? t('rider.workspace.noNew') : t('rider.workspace.offlineHelp'),
  },
  pickup: { label: t('rider.task.accepted'), orders: activeOrders.value.filter(order => order.status === 'accepted'), empty: t('rider.workspace.noPickup') },
  delivery: { label: t('rider.task.delivering'), orders: activeOrders.value.filter(order => order.status === 'delivering'), empty: t('rider.workspace.noDelivery') },
}))
const current = computed(() => stages.value[stage.value])
const orderSections = computed(() => [
  ...(stage.value === 'new' && pendingAssignments.value.length
    ? [{ key: 'assigned', title: t('rider.workspace.pendingAssignments'), orders: pendingAssignments.value }]
    : []),
  { key: stage.value, title: stage.value === 'new' && pendingAssignments.value.length && current.value.orders.length ? t('rider.task.hall') : '', orders: current.value.orders },
])
function goToRecords() {
  go(RiderRoutes.Delivery.tasks)
}

function openTask(id: string) {
  go(RiderRoutes.Delivery.taskDetail, { id })
}

const full = computed(() => maxConcurrent.value > 0 && stats.value.activeCount >= maxConcurrent.value)

const income = computed(() => riderIncomeAmounts(stats.value, serviceArea.value?.currency))

watch([online, maxConcurrent], ([available, capacity], [wasAvailable, previousCapacity]) => {
  if (!available && (wasAvailable || (!previousCapacity && capacity)) && stage.value === 'new') {
    if (stages.value.delivery.orders.length)
      stage.value = 'delivery'
    else if (stages.value.pickup.orders.length)
      stage.value = 'pickup'
  }
})
</script>

<template>
  <view class="rider-shell mx-auto max-w-1120px min-h-screen w-full bg-[#fcf6ef] pb-48rpx text-[var(--app-text-primary)]">
    <wd-toast selector="rider-workspace-address" />
    <view class="rider-header sticky top-0 z-10 border-b border-[#eadfd5] bg-white px-24rpx pt-[var(--status-bar-height)]">
      <view class="grid grid-cols-[1fr_3fr_1fr] min-h-46px items-center">
        <view role="button" :aria-label="t('rider.workspace.back')" class="h-44px w-44px flex items-center" @click="goBackClient">
          <view class="i-carbon-chevron-left h-24px w-24px" />
        </view>
        <text class="text-center text-34rpx font-bold">{{ t('rider.workspace.title') }}</text>
        <view class="flex items-center justify-end gap-16rpx text-26rpx">
          <view role="button" class="min-h-44px flex items-center" @click="go(RiderRoutes.Account.account)">
            {{ t('rider.workspace.account') }}
          </view>
        </view>
      </view>
    </view>

    <view class="rider-content px-24rpx pt-20rpx">
      <view class="border border-[#EAD8C8] rounded-20rpx bg-[#FFF1E4] px-24rpx py-16rpx">
        <view class="flex items-center justify-between gap-12rpx">
          <text class="min-w-0 break-words text-25rpx font-semibold">{{ serviceAreaLabel }}</text>
          <view class="max-w-[65%] flex shrink-0 items-center gap-10rpx text-24rpx">
            <text class="min-w-0 break-words text-[var(--app-text-muted)]">
              {{ t(online ? 'rider.workspace.voice' : 'rider.workspace.voiceOnlineOnly') }}
            </text>
            <switch class="shrink-0" :class="{ 'opacity-50': !online }" :aria-label="t('rider.workspace.voice')" color="#78350F" :disabled="!online" :checked="online && reminderEnabled" @change="toggleReminder" />
          </view>
        </view>
        <text v-if="homeCountry && serviceArea && homeCountry !== serviceArea.countryCode" class="my-8rpx block text-24rpx">
          {{ t('rider.workspace.marketMismatch', { country: marketCountryName(homeCountry) }) }}
        </text>
        <view class="mt-8px flex flex-wrap items-center justify-between gap-12px border-t border-[#EAD8C8] pt-8px">
          <view class="min-w-0">
            <view class="flex items-center gap-10rpx text-30rpx font-bold">
              <view class="h-9px w-9px shrink-0 rounded-full" :class="online ? 'bg-green-600' : 'bg-gray-500'" />
              <text>{{ online ? t('rider.workspace.online') : t('rider.workspace.offline') }}</text>
            </view>
            <text class="text-24rpx text-[var(--app-text-muted)]">{{ t('rider.workspace.capacity', { used: stats.activeCount, limit: maxConcurrent || '—' }) }}</text>
            <text v-if="pendingAssignments.length" class="block text-24rpx text-[var(--app-text-muted)]">
              {{ t('rider.workspace.reservedAssignments', { count: pendingAssignments.length }) }}
            </text>
          </view>
          <wd-button :disabled="submitting || !maxConcurrent || serviceArea === null" :plain="online" @click="toggleOnline">
            {{ online ? t('rider.workspace.goOffline') : t('rider.workspace.goOnline') }}
          </wd-button>
        </view>
      </view>
      <view class="stats-card mt-12px rounded-20rpx bg-white px-24rpx pb-16px leading-tight">
        <view class="flex items-center justify-between gap-8px">
          <text class="text-14px text-[#1F2937] font-bold">{{ t('rider.workspace.todayStats') }}</text>
          <button class="records-link m-0 min-h-44px bg-transparent px-0 text-12px text-[#78350F]" @click="goToRecords">
            {{ t('rider.workspace.viewRecords') }} ›
          </button>
        </view>
        <view class="grid grid-cols-3 mt-10px gap-8px text-center">
          <view>
            <text class="block text-22px text-[#1F2937] font-bold">{{ stats.todayDone }}</text>
            <text class="mt-4px block text-12px text-[#6B7280]">{{ t('rider.task.done') }}</text>
          </view>
          <view>
            <text class="block text-22px text-[#1F2937] font-bold">{{ stats.todayCancelled }}</text>
            <text class="mt-4px block text-12px text-[#6B7280]">{{ t('rider.task.cancelled') }}</text>
          </view>
          <view class="min-w-0">
            <text class="block break-words text-20px text-[#1F2937] font-bold">
              <template v-for="(group, index) in income" :key="group.currency ?? ''">
                <text v-if="index > 0"> / </text>
                <FgPrice :amount="group.currency ? group.amount : undefined" :currency-code="group.currency" amount-unit="settlement" />
              </template>
            </text>
            <text class="mt-4px block text-12px text-[#6B7280]">{{ t('rider.task.feeLabel') }}</text>
          </view>
        </view>
      </view>

      <view v-if="online && latest" class="mt-16rpx text-25rpx font-semibold" @click="stage = 'new'">
        {{ latest }}
      </view>
      <view v-if="announcement" class="mt-16rpx text-25rpx">
        {{ announcement }}
      </view>
      <view v-if="overviewError" class="mt-16rpx text-24rpx text-red-700" @click="refreshOverview">
        {{ overviewError }} · {{ t('rider.workspace.retry') }}
      </view>
      <view class="stage-tabs" role="tablist" :aria-label="t('rider.workspace.stages')">
        <button
          v-for="(tab, key) in stages" :key="key" role="tab" :aria-selected="stage === key"
          class="stage-tab"
          :class="{ 'stage-tab-active': stage === key }"
          @click="stage = key"
        >
          <text class="stage-tab-label">{{ tab.label }} {{ tab.orders.length + (key === 'new' ? pendingAssignments.length : 0) }}</text>
        </button>
      </view>
      <view v-if="online && full && stage === 'new'" class="mb-16rpx rounded-12rpx bg-white p-16rpx text-24rpx">
        {{ t('rider.workspace.capacityHelp') }}
      </view>
      <view v-if="error" class="mb-16rpx flex items-center justify-between gap-12rpx text-26rpx text-red-700">
        <text>{{ error }}</text>
        <view role="button" class="min-h-44px flex items-center font-semibold" @click="refresh">
          {{ t('rider.workspace.retry') }}
        </view>
      </view>
      <view v-if="!orderSections.some(section => section.orders.length) && !error" class="rounded-20rpx bg-white p-32rpx text-center text-26rpx text-[var(--app-text-muted)]">
        <PageLoading v-if="loading" :title="t('rider.task.loading')" />
        <text v-else>{{ current.empty }}</text>
      </view>

      <template v-for="section in orderSections" :key="section.key">
        <text v-if="section.title" class="mb-8px block text-15px font-bold">{{ section.title }}</text>
        <view v-if="section.orders.length" class="grid grid-cols-1 mb-12px gap-12px md:grid-cols-2">
          <view v-for="order in section.orders" :key="order.id" class="rider-task rounded-20rpx bg-white p-24rpx">
            <view class="mb-20rpx flex flex-wrap items-center justify-between gap-16rpx">
              <text class="rounded-8rpx bg-[var(--app-brand-soft)] px-12rpx py-6rpx text-24rpx text-[var(--app-brand-primary)] font-semibold">
                {{ order.status === 'assigned' ? t('rider.task.assigned') : order.status === 'pending' ? t('rider.task.hall') : t(`rider.task.${order.status}`) }}
                <text v-if="order.status === 'assigned' && order.assignmentExpiresAt"> · {{ t('rider.task.remaining', { time: assignmentCountdown(order.assignmentExpiresAt) }) }}</text>
              </text>
              <button class="stat-link detail-link" @click.stop="openTask(order.id)">
                {{ t('rider.task.detail') }} ›
              </button>
              <text v-if="stage === 'new'" class="shrink-0 text-30rpx text-[var(--app-brand-primary)] font-bold"><FgPrice :amount="order.serviceArea?.currency ? order.deliveryFee : undefined" :currency-code="order.serviceArea?.currency" amount-unit="settlement" /></text>
            </view>
            <view v-if="order.status === 'accepted' || order.status === 'delivering'" class="mb-16rpx min-w-0 rounded-12rpx bg-[#fcf6ef] p-16rpx">
              <text class="block text-24rpx text-[var(--app-text-muted)]">
                {{ t(order.status === 'accepted' ? 'rider.task.pickupAddress' : 'rider.task.deliveryAddress') }}
              </text>
              <text class="my-6rpx block break-words text-30rpx font-semibold">
                {{ order.status === 'accepted' ? order.shopAddress : order.address }}
              </text>
              <text class="block break-words text-26rpx text-[var(--app-text-muted)]">
                {{ order.status === 'accepted' ? order.shopName : order.customer }}
              </text>
            </view>
            <view v-if="order.status === 'delivering'" class="mb-16rpx">
              <view class="mt-8rpx flex flex-wrap gap-12rpx text-26rpx font-semibold">
                <text v-if="order.deliveryDistanceKm !== undefined">{{ t('rider.task.deliveryDistance', { distance: order.deliveryDistanceKm.toFixed(1) }) }}</text>
                <text v-if="order.deliverBy" :class="Date.parse(order.deliverBy) < now ? 'text-red-700' : 'text-[var(--app-brand-primary)]'">
                  {{ deliveryDeadlineLabel(order, now) }}
                </text>
              </view>
              <view class="mt-8rpx text-23rpx text-[var(--app-text-muted)]">
                {{ t('rider.task.pickup') }} · {{ order.shopName }}
              </view>
            </view>
            <view v-else-if="order.status !== 'accepted'" class="mb-16rpx flex items-start gap-16rpx">
              <text class="shrink-0 rounded-8rpx bg-[var(--app-brand-soft)] px-10rpx py-4rpx text-22rpx text-[var(--app-brand-primary)]">{{ t('rider.task.pickup') }}</text>
              <view class="min-w-0">
                <view class="text-30rpx font-semibold">
                  {{ order.shopName }}
                </view>
                <view v-if="order.shopAddress" class="mt-6rpx text-24rpx text-[var(--app-text-muted)]">
                  {{ order.shopAddress }}
                </view>
              </view>
            </view>
            <view v-if="order.status !== 'delivering'" class="mb-16rpx flex items-start gap-16rpx">
              <text class="shrink-0 rounded-8rpx bg-[#e5f4eb] px-10rpx py-4rpx text-22rpx text-[#176041]">{{ t('rider.task.dropoff') }}</text>
              <text class="min-w-0 break-words text-28rpx font-medium">
                {{ stage === 'new' ? order.deliveryArea?.trim() || t('rider.task.addressAfterAccept') : order.address }}
              </text>
            </view>
            <view v-if="order.status !== 'delivering' && (order.distance || order.expectTime)" class="mb-20rpx flex flex-wrap gap-16rpx text-24rpx text-[var(--app-text-muted)]">
              <text v-if="order.distance">{{ t('rider.task.pickupDistance', { distance: order.distance }) }}</text>
              <text v-if="order.expectTime">{{ order.expectTime }}</text>
            </view>
            <view v-if="order.status === 'assigned'" class="grid grid-cols-[3fr_7fr] gap-16rpx">
              <wd-button plain block custom-class="!border-transparent !bg-[#F3F4F6] !text-[#4B5563]" :disabled="submitting" @click="rejectAssigned(order)">
                {{ t('rider.task.reject') }}
              </wd-button>
              <wd-button block :disabled="submitting || remainingSeconds(order.assignmentExpiresAt) === 0" @click="acceptAssigned(order)">
                {{ t('rider.task.accept') }}
              </wd-button>
            </view>
            <wd-button v-else-if="order.status === 'pending'" block :disabled="submitting || !online || stats.activeCount >= maxConcurrent" @click="onGrab(order)">
              {{ full ? t('rider.workspace.capacityFull') : t('rider.task.grab') }}
            </wd-button>
            <template v-else>
              <view v-if="order.status === 'accepted'" class="mb-12rpx flex flex-wrap gap-12rpx text-26rpx">
                <text v-if="order.pickupCode" class="text-[var(--app-brand-primary)] font-bold">{{ t('rider.task.pickupCode', { code: order.pickupCode }) }}</text>
                <text v-if="order.itemCount !== undefined">{{ t('rider.task.itemCount', { count: order.itemCount }) }}</text>
                <text v-else-if="order.goodsSummary">{{ order.goodsSummary }}</text>
              </view>
              <view v-if="order.status === 'delivering' && order.phone" class="mb-12rpx flex flex-wrap gap-12rpx text-26rpx">
                <text v-if="order.phone">{{ maskRiderPhone(order.phone) }}</text>
              </view>
              <view class="mb-12rpx flex flex-wrap gap-8rpx" @click.stop>
                <PhoneContact :key="order.version" :resolve-phone="() => order.status === 'accepted' ? resolveShopPhone(order) : resolveCustomerPhone(order)">
                  <template #trigger="{ open }">
                    <button class="task-pill" @click="open">
                      <text class="i-carbon-phone h-16px w-16px" aria-hidden="true" />
                      {{ t(order.status === 'accepted' ? 'rider.task.callShop' : 'rider.task.callCustomer') }}
                    </button>
                  </template>
                </PhoneContact>
                <button class="task-pill" @click="navigateTask(order)">
                  <text class="i-carbon-location h-16px w-16px" aria-hidden="true" />
                  {{ t(order.status === 'accepted' ? 'rider.task.navigatePickup' : 'rider.task.navigateDelivery') }}
                </button>
                <button v-if="(order.status === 'accepted' ? order.shopAddress : order.address).trim()" class="task-pill" @click="copyAddress(order.status === 'accepted' ? order.shopAddress : order.address)">
                  <text class="i-carbon-copy h-16px w-16px" aria-hidden="true" />
                  {{ t('rider.task.copyAddress') }}
                </button>
              </view>
              <view @click.stop>
                <wd-button v-if="order.status === 'accepted'" block :disabled="submitting" @click="onPickup(order)">
                  {{ t('rider.task.confirmPickup') }}
                </wd-button>
                <wd-button v-else block :disabled="submitting" @click="onFinish(order)">
                  {{ t('rider.task.confirmDelivery') }}
                </wd-button>
              </view>
            </template>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<style scoped>
.stage-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin: 8px 0;
}

.stage-tab {
  display: flex;
  min-width: 0;
  min-height: 44px;
  align-items: center;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--app-text-primary);
  font-size: 13px;
  line-height: 1.3;
}

.stage-tab::after {
  border: 0;
}

.stage-tab-label {
  display: flex;
  min-height: 30px;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border-radius: 7px;
  background: var(--app-brand-soft);
}

.stage-tab-active .stage-tab-label {
  background: var(--app-brand-primary);
  color: #fff;
  font-weight: 700;
}

.rider-task {
  min-width: 0;
}

.rider-shell {
  box-shadow: 0 0 20px rgb(0 0 0 / 5%);
}

.stat-link,
.task-pill {
  display: flex;
  align-items: center;
  min-height: 44px;
  gap: 6px;
  margin: 0;
  border: 0;
  line-height: 1.25;
  text-align: left;
  font-size: 13px;
}

.stat-link {
  justify-content: space-between;
  padding: 0;
  background: transparent;
  color: var(--app-brand-primary);
}

.detail-link {
  flex-shrink: 0;
}

.task-pill {
  padding: 0 12px;
  border-radius: 24px;
  background: var(--app-brand-soft);
  color: var(--app-brand-primary);
}

.records-link::after,
.stat-link::after,
.task-pill::after {
  border: 0;
}
</style>
