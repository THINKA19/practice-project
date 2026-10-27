import { onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { toast } from '@/utils/project/feedback'
import { couponApi } from './use-requests'

/**
 * 维护兑换码、密码与提交锁；换号或销毁后丢弃旧结果。
 * @param onSuccess 当前会话兑换成功后的刷新动作。
 */
export function useCouponExchange(onSuccess: () => Promise<void>) {
  const { t } = useI18n()
  const session = useSessionState()
  const number = ref('')
  const pwd = ref('')
  const exchangeCouponsLoading = ref(false)
  let disposed = false
  function clear() {
    number.value = ''
    pwd.value = ''
    exchangeCouponsLoading.value = false
  }
  watch(() => session.sessionRevision, clear, { flush: 'sync' })
  onScopeDispose(() => {
    disposed = true
    clear()
  })
  async function exchangeCoupons() {
    if (disposed || exchangeCouponsLoading.value)
      return
    if (!number.value.trim() || !pwd.value.trim()) {
      toast(t(!number.value.trim() ? 'coupons.enternum' : 'coupons.password'))
      return
    }
    if (!requireIdentity('customer'))
      return
    const account = session.sessionRevision
    exchangeCouponsLoading.value = true
    try {
      await couponApi.exchange(number.value.trim(), pwd.value)
      if (disposed || account !== session.sessionRevision)
        return
      toast(t('coupons.Redemption'))
      await onSuccess()
    }
    catch (error) {
      if (!disposed && account === session.sessionRevision)
        toast(error instanceof Error ? error.message : '兑换失败，请重试')
    }
    finally {
      if (!disposed && account === session.sessionRevision)
        exchangeCouponsLoading.value = false
    }
  }
  return { number, pwd, exchangeCouponsLoading, exchangeCoupons }
}
