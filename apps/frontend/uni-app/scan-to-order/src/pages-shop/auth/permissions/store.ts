import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { MerchantShop, ShopRequestContext } from './models/context'
import { fetchMerchantGrant, fetchMerchantShops } from './api/context'
import { useSession } from '@/pages/auth/session'

export const useMerchantShopStore = defineStore('merchant-shop-context', () => {
  const operator = useSession()

  const shops = ref<MerchantShop[]>([])

  const current = ref<MerchantShop | null>(null)

  const loading = ref(false)

  const revision = ref(0)

  const error = ref('')

  let request = 0

  let refreshing: Promise<boolean> | undefined

  const token = computed(() => operator.identity === 'shop' ? operator.validToken : '')

  function preference() {
    const key = `merchant-last-shop:${operator.userInfo.userId}`

    return { read: () => uni.getStorageSync(key), write: (value: string) => {
      try {
        uni.setStorageSync(key, value)

        return { ok: true }
      }
      catch {
        return { ok: false }
      }
    } }
  }
  function clear() {
    refreshing = undefined

    request++

    shops.value = []

    current.value = null

    loading.value = false

    error.value = ''

    revision.value++
  }
  watch(token, clear, { flush: 'sync' })

  function can(permission: string) {
    return !!token.value && !loading.value && !!current.value?.permissions.includes(permission)
  }
  async function refreshInternal() {
    const sentToken = token.value

    const started = ++request

    if (!sentToken) {
      clear()

      return false
    }
    loading.value = true

    try {
      const result = await fetchMerchantShops(sentToken)

      if (started !== request || sentToken !== token.value)
        return false

      const previous = current.value

      const remembered = previous?.id || preference().read()

      shops.value = result

      current.value = result.find(s => s.id === remembered) || (result.length === 1 ? result[0] : null)

      if (JSON.stringify(previous) !== JSON.stringify(current.value))
        revision.value++

      error.value = result.length ? '' : '尚未分配可用门店'

      return true
    }
    catch (reason) {
      if (started === request && sentToken === token.value) {
        current.value = null

        shops.value = []

        revision.value++

        error.value = reason instanceof Error ? reason.message : '门店授权加载失败'
      }
      return false
    }
    finally {
      if (started === request)
        loading.value = false
    }
  }
  function refresh() {
    if (refreshing)
      return refreshing

    const task = refreshInternal().finally(() => {
      if (refreshing === task)
        refreshing = undefined
    })

    refreshing = task

    return task
  }
  async function switchShop(shopId: string) {
    const sentToken = token.value

    if (!sentToken || !shops.value.some(shop => shop.id === shopId))
      return false

    const started = ++request

    loading.value = true

    try {
      const result = await fetchMerchantGrant(sentToken, shopId)

      if (started !== request || sentToken !== token.value)
        return false

      current.value = result

      revision.value++

      error.value = preference().write(shopId).ok ? '' : '门店已切换，最近门店未能保存'

      return true
    }
    catch (reason) {
      if (started === request)
        error.value = reason instanceof Error ? reason.message : '切换失败'

      return false
    }
    finally {
      if (started === request)
        loading.value = false
    }
  }
  function capture(permission: string): ShopRequestContext {
    if (!can(permission) || !current.value || loading.value)
      throw new Error('当前门店没有操作权限或正在切换，请刷新')

    return { token: token.value, shopId: current.value.id, revision: revision.value }
  }
  function matches(context: ShopRequestContext) {
    return context.token === token.value && context.shopId === current.value?.id && context.revision === revision.value
  }
  return { shops, current, loading, revision, error, can, clear, refresh, switchShop, capture, matches }
})
