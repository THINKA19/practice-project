import { computed, onScopeDispose, reactive, ref, watch } from 'vue'
import { useSessionState } from '@/pages/auth/session'
import { profileApi } from '../../composables/use-profile-requests'
import { profileError } from '../../domain/account.rules'
import type { CustomerProfileForm } from '../../models/types'

/** 面板草稿独立于共享会话，关闭、退出及换账号后丢弃迟到响应。 */
export function useProfileEditor() {
  const session = useSessionState()
  const visible = ref(false)
  const loading = ref(false)
  const saving = ref(false)
  const ready = ref(false)
  const error = ref('')
  const logoutConfirmVisible = ref(false)
  const logoutPending = ref(false)
  let logoutRevision = 0
  const loggedIn = computed(() => session.hasLogin && session.identity === 'customer')
  const form = reactive<CustomerProfileForm>({ gender: 'unknown', birthday: '' })
  let generation = 0
  function reset() {
    logoutConfirmVisible.value = false
    generation++
    loading.value = false
    saving.value = false
    ready.value = false
    error.value = ''
    Object.assign(form, { gender: 'unknown', birthday: '' })
  }
  watch(() => [session.sessionRevision, loggedIn.value] as const, ([, active], previous) => {
    // 退出、过期或切换账号后关闭资料面板，并清空当前草稿。
    if (active || previous?.[1]) {
      visible.value = false
      reset()
    }
  }, { flush: 'sync' })
  watch(visible, (value) => {
    if (!value)
      reset()
  }, { flush: 'sync' })
  onScopeDispose(reset)

  async function load() {
    reset()
    const ticket = generation
    const revision = session.sessionRevision
    loading.value = true
    try {
      const data = await profileApi.read()
      if (ticket !== generation || revision !== session.sessionRevision)
        return
      Object.assign(form, data)
      ready.value = true
    }
    catch (e) {
      if (ticket === generation)
        error.value = e instanceof Error ? e.message : '资料加载失败，请重试'
    }
    finally {
      if (ticket === generation)
        loading.value = false
    }
  }
  function open() {
    session.updateNowTime()
    if (!loggedIn.value)
      return
    visible.value = true
    void load()
  }
  async function save() {
    if (!ready.value || saving.value || !loggedIn.value)
      return
    error.value = profileError(form)
    if (error.value)
      return
    const ticket = generation
    const revision = session.sessionRevision
    saving.value = true
    try {
      await profileApi.save({ gender: form.gender, birthday: form.birthday })
      if (ticket !== generation || revision !== session.sessionRevision)
        return
      uni.showToast({ title: '资料已保存', icon: 'none' })
      visible.value = false
    }
    catch (e) {
      if (ticket === generation)
        error.value = e instanceof Error ? e.message : '保存失败，请重试'
    }
    finally {
      if (ticket === generation)
        saving.value = false
    }
  }
  function logout() {
    if (saving.value || logoutPending.value || !loggedIn.value)
      return
    logoutRevision = session.sessionRevision
    logoutConfirmVisible.value = true
  }
  async function confirmLogout() {
    if (!logoutConfirmVisible.value || logoutPending.value || logoutRevision !== session.sessionRevision)
      return
    logoutPending.value = true
    try {
      await session.logout()
      uni.showToast({ title: '已退出登录', icon: 'none' })
    }
    catch {
      uni.showToast({ title: '已退出当前设备，服务端注销未完成', icon: 'none' })
    }
    finally {
      logoutConfirmVisible.value = false
      logoutPending.value = false
    }
  }
  return { visible, loading, saving, ready, error, logoutConfirmVisible, logoutPending, loggedIn, form, open, load, save, logout, confirmLogout }
}
