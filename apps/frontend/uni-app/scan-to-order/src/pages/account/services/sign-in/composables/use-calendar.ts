/** 签到日历与提交，换号及离开页面后忽略旧响应。 */
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { redirectToLogin, useSessionState } from '@/pages/auth/session'
import { toast } from '@/utils/project/feedback'
import { signApi } from './use-requests'
import { isSignedOn } from '../domain/sign-in.rules'
import type { SignLog } from '../models/types'

/** 维护当月签到展示与提交锁；超时先重读记录，账号变化时清除历史账号的确认标记。 */
export function useSignInCalendar() {
  const { t } = useI18n()
  const session = useSessionState()
  const today = ref(Date.now())
  const scoreSignLogs = ref<SignLog[]>([])
  const signing = ref(false)
  const loading = ref(false)
  const failed = ref(false)
  const confirmedDay = ref<number | null>(null)
  const allowed = computed(() => session.hasLogin && session.identity === 'customer')
  const signed = computed(() => isSignedOn(scoreSignLogs.value, new Date(today.value))
    || (confirmedDay.value !== null && new Date(confirmedDay.value).toDateString() === new Date(today.value).toDateString()))
  let revision = 0
  let disposed = false
  onScopeDispose(() => {
    disposed = true
    revision++
  })
  watch(() => session.sessionRevision, () => {
    revision++
    scoreSignLogs.value = []
    signing.value = false
    loading.value = false
    failed.value = false
    confirmedDay.value = null
  }, { flush: 'sync' })
  const monthLabel = computed(() => {
    const date = new Date(today.value)
    return `${date.getFullYear()}年${date.getMonth() + 1}月`
  })
  const calendarDays = computed(() => {
    const date = new Date(today.value)
    const year = date.getFullYear()
    const month = date.getMonth()
    const offset = new Date(year, month, 1).getDay()
    const count = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: offset + count }, (_, index) => {
      const day = index - offset + 1
      if (day < 1)
        return { key: index, day: '', status: 'empty' }
      const checked = isSignedOn(scoreSignLogs.value, new Date(year, month, day)) || (day === date.getDate() && signed.value)
      return { key: index, day, status: checked ? 'signed' : day === date.getDate() ? 'today' : day < date.getDate() ? 'missed' : 'future' }
    })
  })
  async function refresh() {
    today.value = Date.now()
    session.updateNowTime()
    uni.setNavigationBarTitle({ title: t('account.signDaily') })
    if (!allowed.value || disposed || signing.value)
      return
    const request = ++revision
    loading.value = true
    failed.value = false
    try {
      const logs = await signApi.signLogs()
      if (request === revision && !disposed)
        scoreSignLogs.value = logs
    }
    catch {
      if (request === revision && !disposed)
        failed.value = true
    }
    finally {
      if (request === revision && !disposed)
        loading.value = false
    }
  }
  async function sign() {
    today.value = Date.now()
    session.updateNowTime()
    if (disposed || signing.value || loading.value)
      return
    if (!allowed.value) {
      redirectToLogin({ identity: 'customer' })
      return
    }
    if (signed.value)
      return
    if (failed.value) {
      toast('请先重新加载签到记录')
      return
    }
    const request = ++revision
    signing.value = true
    try {
      const signedAt = today.value
      await signApi.sign()
      if (request !== revision || disposed)
        return
      confirmedDay.value = signedAt
      toast(t('account.sign.success'))
      signing.value = false
      await refresh()
    }
    catch {
      // 超时可能已在服务端提交；先刷新记录，再允许用户重试。
      if (request === revision && !disposed) {
        signing.value = false
        await refresh()
      }
    }
    finally {
      if (!disposed && request === revision)
        signing.value = false
    }
  }
  return { monthLabel, calendarDays, scoreSignLogs, signing, loading, failed, signed, refresh, sign }
}
