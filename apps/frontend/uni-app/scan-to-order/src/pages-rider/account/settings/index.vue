<!--
============================================================================
【文件概述】接单规则与提醒设置页面视图；状态和操作由本模块组合函数提供。
【方法与导出清单】页面默认组件；useRiderSettingsPage 负责页面装配。
【综合使用示例】
import { useRiderSettingsPage } from './composables/use-page'
const page = useRiderSettingsPage() // 在 script setup 中绑定页面数据
============================================================================
-->
<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import { onShow } from '@dcloudio/uni-app'
import { t } from '@/locale'
import { useRiderSettingsPage } from './composables/use-page'

definePage({ style: { navigationBarTitleText: '骑手设置', navigationBarBackgroundColor: '#A0826D', navigationBarTextStyle: 'white' } })
const { online, maxConcurrent, section, rules, error, refresh, enabled, vibrate, message, latest, toggle, toggleVibrate, preview } = useRiderSettingsPage()

onShow(() => uni.setNavigationBarTitle({ title: t('rider.settings.title') }))
</script>

<template>
  <view class="min-h-screen bg-[#FFF8F1] p-32rpx text-[#5A3A22]">
    <view class="grid grid-cols-2 mb-32rpx gap-24rpx">
      <wd-button :plain="section !== 'rules'" @click="section = 'rules'">
        {{ t('rider.settings.rules') }}
      </wd-button>
      <wd-button :plain="section !== 'reminders'" @click="section = 'reminders'">
        {{ t('rider.settings.reminders') }}
      </wd-button>
    </view>
    <view v-if="section === 'rules'" class="mb-32rpx rounded-24rpx bg-white p-32rpx">
      <view class="mb-24rpx flex justify-between">
        <text>{{ t('rider.settings.status') }}</text><text>{{ online ? t('rider.workspace.online') : t('rider.workspace.offline') }}</text>
      </view>
      <view class="flex justify-between">
        <text>{{ t('rider.settings.limit') }}</text><text>{{ rules?.maxConcurrent || maxConcurrent }}</text>
      </view>
      <view class="mt-24rpx text-24rpx text-[#A0826D]">
        {{ t('rider.settings.limitHelp') }}
      </view>
      <view v-if="rules && rules.assignmentTimeoutSeconds > 0" class="mt-24rpx flex justify-between gap-12rpx">
        <text>{{ t('rider.settings.assignmentTimeout') }}</text>
        <text>{{ t('rider.settings.assignmentTimeoutValue', { seconds: rules.assignmentTimeoutSeconds }) }}</text>
      </view>
      <view class="mt-24rpx">
        <PageLoading v-if="!rules && !error" inline :title="t('rider.task.loading')" />
        <text v-else-if="rules">{{ t('rider.profile.shops', { shops: rules.serviceShops.map(s => s.name).join('、') || '—' }) }}</text>
      </view>
      <view v-for="(rule, index) in rules?.rules" :key="rule" class="mt-24rpx text-26rpx leading-relaxed">
        {{ index + 1 }}. {{ rule }}
      </view>
      <view v-if="error" class="my-24rpx text-red-600">
        {{ error }}
      </view>
      <wd-button plain block custom-class="!mt-32rpx" @click="refresh">
        {{ t('rider.settings.reload') }}
      </wd-button>
    </view>
    <view v-else class="rounded-24rpx bg-white p-32rpx">
      <view class="mb-24rpx text-32rpx font-semibold">
        {{ t('rider.settings.newTasks') }}
      </view>
      <wd-button block :disabled="!online" @click="toggle">
        {{ enabled ? t('rider.settings.soundOff') : t('rider.settings.soundOn') }}
      </wd-button>
      <view class="my-24rpx text-26rpx">
        {{ online ? message : t('rider.workspace.voiceOnlineOnly') }}
      </view>
      <wd-button plain block @click="preview">
        {{ t('rider.settings.preview') }}
      </wd-button>
      <wd-button plain block custom-class="!mt-24rpx" @click="toggleVibrate">
        {{ vibrate ? t('rider.settings.vibrationOff') : t('rider.settings.vibrationOn') }}
      </wd-button>
      <view class="mt-24rpx text-24rpx leading-relaxed">
        {{ t('rider.settings.help') }}
      </view>
      <view v-if="latest" class="mt-24rpx text-26rpx">
        {{ t('rider.settings.latest', { message: latest }) }}
      </view>
    </view>
  </view>
</template>
