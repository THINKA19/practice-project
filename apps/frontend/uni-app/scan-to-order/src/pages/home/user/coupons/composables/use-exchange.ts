import { onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { toast } from '@/utils/project/feedback'
import { couponApi } from './use-requests'

/** 维护兑换码、密码与提交锁；换号或销毁后丢弃旧结果。 */
export function useCouponExchange() {
  const { t } = useI18n()
  const session = useSessionState()
  const number = ref('')
  const pwd = ref('')
  const exchanging = ref(false)
  let disposed = false
  function clear() {
    number.value = ''
    pwd.value = ''
    exchanging.value = false
  }
  watch(() => session.sessionRevision, clear, { flush: 'sync' })
  onScopeDispose(() => {
    disposed = true
    clear()
  })
  async function redeemCoupon() {
    if (disposed || exchanging.value)
      return
    const code = number.value.trim()
    const password = pwd.value
    if (!code || !password.trim()) {
      toast(t(!code ? 'coupons.enternum' : 'coupons.password'))
      return
    }
    if (!requireIdentity('customer'))
      return
    const account = session.sessionRevision
    const current = () => !disposed && account === session.sessionRevision
    exchanging.value = true
    try {
      await couponApi.exchange(code, password)
      if (!current())
        return
      pwd.value = ''
      toast(t('coupons.Redemption'))
    }
    catch (error) {
      if (current())
        toast(error instanceof Error ? error.message : '兑换失败，请重试')
    }
    finally {
      if (current())
        exchanging.value = false
    }
  }
  return { number, pwd, exchanging, redeemCoupon }
}
