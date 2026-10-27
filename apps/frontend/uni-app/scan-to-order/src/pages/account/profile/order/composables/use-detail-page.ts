import { ref } from 'vue'
import type { OrderDetail } from '../models/types'
import { orderApi } from './use-requests'
import { getIdentity, getToken, requireIdentity, useSessionAccountScope } from '@/pages/auth/session'

/** Detail page state; the route component only binds parameters and lifecycle. */
export function useOrderDetailPage() {
  const detail = ref<OrderDetail | null>(null)
  const loading = ref(true)
  const failed = ref(false)
  const needsLogin = ref(false)
  let loginRequested = false
  let id = ''
  let generation = 0
  const scope = useSessionAccountScope(() => {
    generation++

    detail.value = null

    loading.value = false
  })
  async function load() {
    needsLogin.value = !(getToken() && getIdentity() === 'customer')
    if (needsLogin.value) {
      loading.value = false
      if (!loginRequested) {
        loginRequested = true
        requireIdentity('customer')
      }
      return
    }
    loginRequested = false

    const ticket = scope.ticket()

    const request = ++generation

    loading.value = true

    failed.value = false

    try {
      if (!id)
        throw new Error('缺少订单编号')

      const result = await orderApi.detail(id)

      if (!result?.orderInfo || !Array.isArray(result.goods))
        throw new Error('订单详情数据无效')
      if (scope.current(ticket) && request === generation)
        detail.value = result
    }
    catch {
      if (scope.current(ticket) && request === generation)
        failed.value = true
    }
    finally {
      if (scope.current(ticket) && request === generation)
        loading.value = false
    }
  }

  function init(query?: { id?: unknown }) {
    id = String(query?.id || '')
  }
  function login() {
    requireIdentity('customer')
  }
  return { detail, loading, failed, needsLogin, init, load, login }
}
