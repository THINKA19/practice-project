<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'
import { t } from '@/locale'
import { shopText as st } from '@/locale/shop-text'
import { useMerchantPage } from '@/pages-shop/auth/permissions'
import { confirm, toast } from '@/utils/project/interaction'
import { useShopSettings } from './composables/index/useShopSettings'
import { useMerchantNoticeLifecycle } from './composables/useMerchantNoticeLifecycle'

definePage({
  style: {
    navigationBarTitleText: '店铺设置',
  },
})

useMerchantNoticeLifecycle(useMerchantPage())

const { form, schedule, today, closure, closurePlan, canUpdate, loading, saving, load, updateSettings } = useShopSettings()
const opensAt = ref('')
const closesAt = ref('')
const closedFrom = ref('')
const closedUntil = ref('')
const notice = ref('')
const editing = ref<'hours' | 'closure' | 'status'>()
const businessEnabled = ref(true)
const cancelStyle = '!bg-[#f1f1f1] !text-[#454545]'
const confirmStyle = '!bg-[#8B5A3C] !text-white'
const isOpen = computed(() => !closure.value && form.value?.businessStatus && schedule.value.isOpen)
const multipleHours = computed(() => {
  const hours = form.value?.businessHours ?? []
  return hours.length > 1 || hours.some(hour => !hour.on || hour.day !== '每日')
})
const status = computed(() => {
  if (closure.value)
    return st('临时休店')
  if (!form.value?.businessStatus)
    return st('已停止营业')
  return st(schedule.value.isOpen ? '营业中' : '休息中')
})

watch(form, (value) => {
  if (!value)
    editing.value = undefined
})

async function saveHours() {
  const current = form.value
  if (!opensAt.value || !closesAt.value || opensAt.value === closesAt.value) {
    toast(st('请选择不同的开始和结束时间'))
    return
  }

  if (multipleHours.value && !await confirm({
    title: st('修改营业时间'),
    content: st('保存后，每天使用这一个营业时段，原有分日或分段排班将被替换。'),
  })) {
    return
  }

  if (current !== form.value)
    return

  if (await updateSettings({ businessHours: [{ day: '每日', open: opensAt.value, close: closesAt.value, on: true }] }))
    editing.value = undefined
}

function editStatus() {
  businessEnabled.value = !!form.value?.businessStatus
  editing.value = 'status'
}

async function saveStatus() {
  if (await updateSettings({ businessStatus: businessEnabled.value }))
    editing.value = undefined
}

function editHours() {
  const hours = form.value?.businessHours.find(hour => hour.on)
  opensAt.value = hours?.open ?? ''
  closesAt.value = hours?.close ?? ''
  editing.value = 'hours'
}

async function endClosure() {
  const current = form.value
  const confirmed = await confirm({
    title: st(closure.value ? '提前结束休店' : '取消休店安排'),
    content: st('结束后按原营业时间和接单状态执行。'),
  })
  if (confirmed && current === form.value)
    await updateSettings({ temporaryClosure: null })
}

function editClosure() {
  closedFrom.value = closurePlan.value?.from ?? today.value
  closedUntil.value = closurePlan.value?.until ?? today.value
  notice.value = closurePlan.value?.notice ?? ''
  editing.value = 'closure'
}

function changeClosureStart(value: string) {
  closedFrom.value = value
  if (closedUntil.value < value)
    closedUntil.value = value
}

async function saveClosure() {
  if (!closedFrom.value || closedUntil.value < closedFrom.value || closedUntil.value < today.value) {
    toast(st('结束日期须在开始日期当天或之后，且不能早于今天'))
    return
  }
  if (await updateSettings({ temporaryClosure: { from: closedFrom.value, until: closedUntil.value, notice: notice.value.trim() } }))
    editing.value = undefined
}

onShow(() => uni.setNavigationBarTitle({ title: t('shop.messages.storeSettings') }))
watch(() => t('shop.messages.storeSettings'), title => uni.setNavigationBarTitle({ title }))
</script>

<template>
  <view class="box-border min-h-100vh bg-[#f5f7f6] p-24rpx">
    <view v-if="loading" class="p-32rpx text-center text-26rpx text-[#526159]">
      {{ st('正在加载门店设置…') }}
    </view>
    <view v-else-if="!form" class="rounded-24rpx bg-white p-32rpx text-center">
      <view class="mb-24rpx text-26rpx text-[#526159]">
        {{ st('暂时无法读取门店设置') }}
      </view>
      <wd-button plain size="small" @click="load">
        {{ st('重新加载设置') }}
      </wd-button>
    </view>
    <template v-else>
      <view class="rounded-24rpx bg-white p-32rpx">
        <view class="flex items-center justify-between gap-16rpx">
          <view class="flex items-center gap-12rpx text-32rpx font-semibold" :class="isOpen ? 'text-[#018d71]' : 'text-[#17392a]'">
            <view class="h-14rpx w-14rpx rounded-full" :class="isOpen ? 'bg-[#018d71]' : 'bg-[#9ca3af]'" />
            {{ status }}
          </view>
          <wd-button v-if="!editing" variant="text" size="small" :disabled="saving || !canUpdate" custom-class="!text-[#8B5A3C]" @click="editStatus">
            {{ st('设置') }}
          </wd-button>
        </view>
        <view class="mb-24rpx mt-8rpx text-26rpx text-[#526159]">
          <template v-if="closure">
            {{ st('休店至') }} {{ closure.until }}{{ st('（含当天）') }}
          </template>
          <template v-else-if="!form.businessStatus">
            {{ st('已手动停止营业，恢复后按营业时间接单。') }}
          </template>
          <template v-else-if="schedule.isOpen">
            {{ st('顾客可正常下单点餐') }}
          </template>
          <template v-else>
            {{ st('当前不在营业时段') }}
          </template>
        </view>
        <view class="border-t border-[#dce7e2] pt-24rpx">
          <view class="flex items-center justify-between gap-16rpx">
            <view class="text-26rpx text-[#526159]">
              {{ st(multipleHours ? '今日营业时间' : '每日营业时间') }}
            </view>
            <wd-button v-if="!editing" variant="text" size="small" :disabled="saving || !canUpdate" custom-class="!text-[#8B5A3C]" @click="editHours">
              {{ st('修改') }}
            </wd-button>
          </view>
          <template v-if="multipleHours">
            <view v-for="(period, index) in schedule.today" :key="index" class="text-28rpx text-[#17392a]">
              {{ period.continuesFromYesterday ? st('昨日') : '' }} {{ period.open }}–{{ period.close }}
              {{ period.overnight && !period.continuesFromYesterday ? st('次日') : '' }}
            </view>
            <view v-if="!schedule.today.length" class="text-28rpx text-[#17392a]">
              {{ st('今日无营业时段') }}
            </view>
          </template>
          <view v-else class="text-28rpx text-[#17392a]">
            <template v-if="form.businessHours[0]">
              {{ form.businessHours[0].open }}–{{ form.businessHours[0].close }}
              {{ form.businessHours[0].close < form.businessHours[0].open ? st('次日') : '' }}
            </template>
            <template v-else>
              {{ st('尚未设置营业时间') }}
            </template>
          </view>
          <view v-if="closure?.notice" class="mt-16rpx whitespace-pre-wrap text-26rpx text-[#526159]">
            {{ closure.notice }}
          </view>
        </view>
      </view>

      <view v-if="editing === 'status'" class="mt-24rpx rounded-24rpx bg-white p-32rpx">
        <view class="mb-16rpx text-30rpx text-[#17392a] font-semibold">
          {{ st('营业状态设置') }}
        </view>
        <wd-radio-group v-model="businessEnabled" :disabled="saving || !canUpdate" checked-color="#8B5A3C">
          <wd-radio :value="true">
            {{ st('继续营业') }}
          </wd-radio>
          <wd-radio :value="false">
            {{ st('停止营业') }}
          </wd-radio>
        </wd-radio-group>
        <view class="mb-20rpx mt-16rpx text-24rpx text-[#526159]">
          {{ st(businessEnabled ? '按营业时间接单，已安排的临时休店仍然有效。' : '停止接收新订单，直到手动恢复。') }}
        </view>
        <view class="flex justify-end gap-16rpx">
          <wd-button :custom-class="cancelStyle" :disabled="saving" @click="editing = undefined">
            {{ st('取消') }}
          </wd-button>
          <wd-button :custom-class="confirmStyle" :disabled="saving || !canUpdate || businessEnabled === form.businessStatus" @click="saveStatus">
            {{ st('确认修改') }}
          </wd-button>
        </view>
      </view>

      <view v-if="editing === 'hours'" class="mt-24rpx rounded-24rpx bg-white p-32rpx">
        <view class="mb-16rpx text-30rpx text-[#17392a] font-semibold">
          {{ st('修改营业时间') }}
        </view>
        <view v-if="multipleHours" class="mb-16rpx text-24rpx text-[#526159]">
          {{ st('当前使用分日或分段排班，保存后改为每日同一时段。') }}
        </view>
        <view class="grid grid-cols-2 mb-24rpx gap-20rpx">
          <view>
            <view class="mb-8rpx text-24rpx text-[#526159]">
              {{ st('开始营业') }}
            </view>
            <picker mode="time" :value="opensAt" :disabled="saving || !canUpdate" @change="opensAt = String($event.detail.value)">
              <view class="flex items-center justify-between border border-[#dce7e2] rounded-16rpx bg-white p-20rpx text-28rpx text-[#17392a]">
                {{ opensAt || st('选择时间') }}
                <view class="i-carbon-chevron-down h-28rpx w-28rpx text-[#8B5A3C]" />
              </view>
            </picker>
          </view>
          <view>
            <view class="mb-8rpx text-24rpx text-[#526159]">
              {{ st('结束营业') }}
            </view>
            <picker mode="time" :value="closesAt" :disabled="saving || !canUpdate" @change="closesAt = String($event.detail.value)">
              <view class="flex items-center justify-between border border-[#dce7e2] rounded-16rpx bg-white p-20rpx text-28rpx text-[#17392a]">
                {{ closesAt || st('选择时间') }}
                <view class="i-carbon-chevron-down h-28rpx w-28rpx text-[#8B5A3C]" />
              </view>
            </picker>
          </view>
        </view>
        <view v-if="opensAt && closesAt && closesAt < opensAt" class="mb-20rpx text-24rpx text-[#526159]">
          {{ st('次日') }} {{ closesAt }} {{ st('结束营业') }}
        </view>
        <view class="flex justify-end gap-16rpx">
          <wd-button :custom-class="cancelStyle" :disabled="saving" @click="editing = undefined">
            {{ st('取消') }}
          </wd-button>
          <wd-button :disabled="saving || !canUpdate" :custom-class="confirmStyle" @click="saveHours">
            {{ st('确认修改') }}
          </wd-button>
        </view>
      </view>

      <view v-if="!editing" class="mt-24rpx rounded-24rpx bg-white p-32rpx">
        <view class="flex items-center justify-between gap-16rpx">
          <view>
            <view class="text-28rpx text-[#17392a] font-semibold">
              {{ st('临时休店') }}
            </view>
            <view class="mt-8rpx text-24rpx text-[#526159]">
              <template v-if="closurePlan">
                {{ closurePlan.from ? `${closurePlan.from} – ` : st('休店至') }}{{ closurePlan.until }} {{ st('（含当天）') }}
              </template>
              <template v-else>
                {{ st('外出或停业几天时使用') }}
              </template>
            </view>
          </view>
          <wd-button v-if="!editing" variant="text" size="small" :disabled="saving || !canUpdate" custom-class="!text-[#8B5A3C]" @click="editClosure">
            {{ st(closurePlan ? '修改' : '设置') }}
          </wd-button>
        </view>
        <wd-button v-if="closurePlan" variant="text" size="small" :disabled="saving || !canUpdate" custom-class="!text-[#8B5A3C]" @click="endClosure">
          {{ st(closure ? '提前结束休店' : '取消休店安排') }}
        </wd-button>
      </view>

      <view v-if="editing === 'closure'" class="mt-24rpx rounded-24rpx bg-white p-32rpx">
        <view class="mb-12rpx text-30rpx text-[#17392a] font-semibold">
          {{ st('临时休店') }}
        </view>
        <view class="mb-20rpx text-26rpx text-[#526159]">
          {{ st('适用于外出或临时停业。截止日期过后恢复原营业安排。') }}
        </view>
        <view class="grid grid-cols-2 mb-20rpx gap-20rpx">
          <view>
            <view class="mb-8rpx text-24rpx text-[#526159]">
              {{ st('开始日期') }}
            </view>
            <picker mode="date" :value="closedFrom" :start="closurePlan?.from && closurePlan.from < today ? closurePlan.from : today" :disabled="saving || !canUpdate" @change="changeClosureStart(String($event.detail.value))">
              <view class="flex items-center justify-between border border-[#dce7e2] rounded-16rpx bg-white p-20rpx text-26rpx text-[#17392a]">
                {{ closedFrom }}
                <view class="i-carbon-chevron-down h-28rpx w-28rpx shrink-0 text-[#8B5A3C]" />
              </view>
            </picker>
          </view>
          <view>
            <view class="mb-8rpx text-24rpx text-[#526159]">
              {{ st('结束日期（含当天）') }}
            </view>
            <picker mode="date" :value="closedUntil" :start="closedFrom > today ? closedFrom : today" :disabled="saving || !canUpdate" @change="closedUntil = String($event.detail.value)">
              <view class="flex items-center justify-between border border-[#dce7e2] rounded-16rpx bg-white p-20rpx text-26rpx text-[#17392a]">
                {{ closedUntil }}
                <view class="i-carbon-chevron-down h-28rpx w-28rpx shrink-0 text-[#8B5A3C]" />
              </view>
            </picker>
          </view>
        </view>
        <view class="mb-8rpx text-24rpx text-[#526159]">
          {{ st('休店告示（选填）') }}
        </view>
        <view class="mb-12rpx text-24rpx text-[#526159]">
          {{ st('可填写休店原因和预计恢复营业时间。') }}
        </view>
        <wd-textarea v-model="notice" :maxlength="100" :disabled="saving || !canUpdate" :placeholder="st('例如：外出办事，周五恢复营业')" />
        <view class="mt-20rpx flex justify-end gap-16rpx">
          <wd-button :custom-class="cancelStyle" :disabled="saving" @click="editing = undefined">
            {{ st('取消') }}
          </wd-button>
          <wd-button :disabled="saving || !canUpdate" :custom-class="confirmStyle" @click="saveClosure">
            {{ st('确认修改') }}
          </wd-button>
        </view>
      </view>
    </template>
  </view>
</template>
