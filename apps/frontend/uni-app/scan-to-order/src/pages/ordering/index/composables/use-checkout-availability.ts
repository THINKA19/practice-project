/** 门店结算资格的统一入口；允许浏览和加购，交易前重新读取服务端门店。 */
import { computed, onScopeDispose, ref } from 'vue'
import { getSessionRevision } from '@/pages/auth/session'
import { useShopStore } from '../store'
import { shopApi } from '../api/shop.api'
import { toShopDetail } from '../models/mappers'
import { shopCheckoutReason } from '../domain/shop.rules'

export function useShopCheckoutAvailability() {
  const store = useShopStore()
  const now = ref(Date.now())
  const timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
  onScopeDispose(() => clearInterval(timer))
  const reason = computed(() => shopCheckoutReason(store.current, now.value))

  /** 网络失败、换店、换账号或已停止营业时均不继续交易。 */
  async function ensureAvailable(expectedId = store.current?.id): Promise<void> {
    const previous = store.current
    const session = getSessionRevision()
    if (!previous || expectedId !== previous.id)
      throw new Error('门店已变更，请返回重新确认')
    let next
    try {
      next = toShopDetail(await shopApi.detail(previous.id)).info
    }
    catch {
      throw new Error('无法确认门店营业状态，请稍后重试')
    }
    if (session !== getSessionRevision() || store.current !== previous || next.id !== expectedId)
      throw new Error('门店或账号已变更，请返回重新确认')
    store.setCurrent({ ...next, distance: previous.distance })
    now.value = Date.now()
    const blocked = shopCheckoutReason(next, now.value)
    if (blocked)
      throw new Error(blocked)
  }
  return { reason, ensureAvailable }
}
