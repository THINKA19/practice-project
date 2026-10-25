import { onScopeDispose, reactive, ref } from 'vue'
import { registerError } from '../models/register'
import { registerApi } from '../api/register'
import { resolveRedirect } from '../../login'
import { useTokenStore } from '@/store/token'
import { getAllPages } from '@/utils'
import { ClientRoutes } from '@/pages/routes'
import { t } from '@/locale'

export function useRegister() {
  const form = reactive({ username: '', password: '', confirmPassword: '' })
  const agreed = ref(false)
  const loading = ref(false)
  const error = ref('')
  const completed = ref(false)
  const redirect = ref(ClientRoutes.Home.home as string)
  let disposed = false
  onScopeDispose(() => {
    disposed = true
    form.password = ''
    form.confirmPassword = ''
  })
  function init(query?: Record<string, unknown>) {
    if (useTokenStore().updateNowTime().hasLogin) {
      uni.reLaunch({ url: ClientRoutes.Home.home })
      return
    }
    redirect.value = resolveRedirect(query?.redirect, getAllPages().map(p => p.path), ClientRoutes.Home.home)
  }
  function toLogin() {
    uni.redirectTo({ url: `${ClientRoutes.Auth.login}?username=${encodeURIComponent(form.username.trim())}&redirect=${encodeURIComponent(redirect.value)}`, fail: () => {
      error.value = t('common.navigationFailed')
    } })
  }
  async function submit() {
    if (loading.value || completed.value)
      return
    error.value = ''
    const validation = !agreed.value ? 'auth.agreementRequired' : registerError(form)
    if (validation) {
      error.value = t(validation)
      return
    }
    loading.value = true
    try {
      await registerApi.register(form)
      if (disposed)
        return
      completed.value = true
      form.password = ''
      form.confirmPassword = ''
      toLogin()
    }
    catch (e) {
      if (!disposed)
        error.value = e instanceof Error ? e.message : t('auth.registerFailed')
    }
    finally {
      if (!disposed)
        loading.value = false
    }
  }
  return { form, agreed, loading, error, completed, init, submit, toLogin }
}
