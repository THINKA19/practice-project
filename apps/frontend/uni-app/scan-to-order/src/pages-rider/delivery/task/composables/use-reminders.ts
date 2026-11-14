/**
 * ============================================================================
 * 【文件概述】配送任务的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderTaskReminders：组合首帧抑制、事件去重和音频生命周期；仅在前台提示。
 * 【综合使用示例】
 * import { useRiderTaskReminders } from '@/pages-rider/delivery/task/composables/use-reminders'
 * const reminders = useRiderTaskReminders(); reminders.pause() // 停止声音并暂停提示
 * ============================================================================
 */
import { t } from '@/locale'
import { defineStore } from 'pinia'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useSessionState } from '@/pages/auth/session'
import { useRiderReminderPreferences } from '../storage/preferences'
import { createRiderCuePlayer } from '../adapters/audio'
import { createRiderReminderTracker } from '../domain/reminder.rules'
import { useRiderTaskStore } from './use-store'

/**
 * 组合首帧抑制、事件去重和音频生命周期；仅在前台提示。
 * 无参数；须在已安装 Pinia 的应用中调用。
 * @returns 当前 Pinia 实例中本领域的状态与操作。
 * @example const reminders = useRiderTaskReminders(); reminders.pause() // 停止声音并暂停提示
 */
export const useRiderTaskReminders = defineStore('rider-reminders', () => {
  const session = useSessionState()
  const tasks = useRiderTaskStore()
  const preferences = useRiderReminderPreferences()
  const tracker = createRiderReminderTracker()
  const enabled = ref(false)
  const vibrate = ref(false)
  const message = ref(t('rider.settings.soundDisabled'))
  const latest = ref('')
  const identity = computed(() => session.identity === 'rider' && session.hasLogin ? session.sessionRevision : 0)
  const accountId = computed(() => identity.value ? JSON.stringify([import.meta.env.MODE, import.meta.env.VITE_SERVER_BASEURL, session.userInfo.userId]) : '')
  let foreground = false
  const player = createRiderCuePlayer(() => {
    message.value = t('rider.settings.soundFailed')
  })
  function play() {
    if (foreground && identity.value)
      player.play()
  }
  function prepareAudio() {
    if (identity.value && enabled.value)
      player.prepare()
  }
  function preview() {
    if (foreground && identity.value) {
      player.prepare()
      play()
    }
  }
  function persist() {
    if (identity.value)
      preferences.write(accountId.value, { enabled: enabled.value, vibrate: vibrate.value })
  }
  function toggle() {
    if (!identity.value || !tasks.online)
      return
    enabled.value = !enabled.value
    message.value = enabled.value ? t('rider.settings.soundEnabled') : t('rider.settings.soundDisabled')
    player.stop()
    if (enabled.value)
      preview()
    persist()
  }
  function toggleVibrate() {
    if (!identity.value)
      return
    vibrate.value = !vibrate.value
    persist()
  }
  function pause() {
    foreground = false
    player.stop()
  }
  function resume() {
    foreground = true
  }
  watch(identity, () => {
    pause()
    player.dispose()
    tracker.reset()
    latest.value = ''
    const saved = preferences.read(accountId.value)
    enabled.value = saved.enabled
    vibrate.value = saved.vibrate
    message.value = enabled.value ? t('rider.settings.soundEnabled') : t('rider.settings.soundDisabled')
  }, { immediate: true, flush: 'sync' })
  onScopeDispose(player.dispose)
  watch(() => tasks.online, (online) => {
    if (!online) {
      player.stop()
      latest.value = ''
    }
  }, { flush: 'sync' })
  function inspect() {
    if (!foreground || !identity.value || !tasks.riderId || tasks.error)
      return
    const found = tracker.inspect(tasks.online ? tasks.orders : [], tasks.riderId, tasks.online)
    if (!found)
      return
    latest.value = found
    if (enabled.value)
      play()
    if (vibrate.value) {
      const sent = identity.value
      uni.vibrateShort({ fail: () => {
        if (sent === identity.value)
          message.value = t('rider.settings.noVibration')
      } })
    }
  }
  return { enabled, vibrate, message, latest, toggle, toggleVibrate, preview, prepareAudio, resume, pause, inspect }
})
