import { computed, onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { toast } from '@/utils/project/feedback'
import type { CouponTemplate } from '../models/types'
import { couponFetchErrorKey } from '../domain/coupons.rules'
import { couponApi } from './use-requests'

/** 维护领券密码弹窗、单次提交锁及当前会话已领取标记。 */
export function useCouponFetch() {
  const { t } = useI18n()
  const session = useSessionState()
  const showPwdPop = ref(false)
  const couponPwd = ref('')
  const fetchingId = ref<number | null>(null)
  const fetching = computed(() => fetchingId.value !== null)
  const claimedIds = ref<Set<number>>(new Set())
  let pwdCouponId: number | null = null
  let disposed = false
  function resetPassword() {
    showPwdPop.value = false
    couponPwd.value = ''
    pwdCouponId = null
  }
  function clear() {
    resetPassword()
    fetchingId.value = null
    claimedIds.value = new Set()
  }
  watch(() => session.sessionRevision, clear, { flush: 'sync' })
  onScopeDispose(() => {
    disposed = true
    clear()
  })
  async function submitClaim(id: number, password?: string) {
    const account = session.sessionRevision
    const current = () => !disposed && account === session.sessionRevision
    fetchingId.value = id
    try {
      await couponApi.fetch({ id, pwd: password })
      if (!current())
        return
      claimedIds.value.add(id)
      resetPassword()
      toast(t('coupons.Successfullyclaimed'))
    }
    catch (error) {
      if (!current())
        return
      const message = error instanceof Error ? error.message : '领取失败，请重试'
      const code = Number(message.match(/请求错误\[(\d+)\]/)?.[1])
      const key = couponFetchErrorKey(code)
      uni.showModal({ content: key ? t(key) : message, showCancel: false })
    }
    finally {
      if (current())
        fetchingId.value = null
    }
  }
  function isClaimed(item: CouponTemplate) {
    return Boolean(item.claimed) || claimedIds.value.has(item.id)
  }
  function claimCoupon(item: CouponTemplate) {
    if (disposed || fetching.value || isClaimed(item) || !requireIdentity('customer'))
      return
    resetPassword()
    if (item.pwd) {
      pwdCouponId = item.id
      showPwdPop.value = true
      return
    }
    return submitClaim(item.id, '')
  }
  function confirmPassword() {
    if (disposed || fetching.value || pwdCouponId === null)
      return
    if (!couponPwd.value.trim()) {
      toast(t('coupons.inputpassword'))
      return
    }
    if (requireIdentity('customer'))
      return submitClaim(pwdCouponId, couponPwd.value)
  }
  function closePassword() {
    if (!fetching.value)
      resetPassword()
  }
  return { showPwdPop, couponPwd, fetching, fetchingId, isClaimed, claimCoupon, confirmPassword, closePassword }
}
