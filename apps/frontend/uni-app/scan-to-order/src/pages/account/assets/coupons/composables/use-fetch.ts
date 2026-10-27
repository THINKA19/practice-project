import { onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { toast } from '@/utils/project/feedback'
import type { CouponTemplate } from '../models/types'
import { couponFetchErrorKey } from '../domain/coupons.rules'
import { couponApi } from './use-requests'

/**
 * 维护领券密码弹窗、单次提交锁及当前会话已领取标记。
 * @param onSuccess 领取经服务端确认后，更新对应券展示的动作。
 */
export function useCouponFetch(onSuccess: (id: number) => Promise<void>) {
  const { t } = useI18n()
  const session = useSessionState()
  const showPwdPop = ref(false)
  const couponPwd = ref('')
  const fetching = ref(false)
  const fetchingId = ref<number | null>(null)
  const claimedIds = ref<Set<number>>(new Set())
  let pwdCouponId: number | null = null
  let disposed = false
  function clear() {
    showPwdPop.value = false
    couponPwd.value = ''
    pwdCouponId = null
    fetching.value = false
    fetchingId.value = null
  }
  watch(() => session.sessionRevision, () => {
    clear()
    claimedIds.value = new Set()
  }, { flush: 'sync' })
  onScopeDispose(() => {
    disposed = true
    clear()
  })
  async function doFetch(id: number) {
    if (disposed || fetching.value || !requireIdentity('customer'))
      return
    const account = session.sessionRevision
    const password = couponPwd.value
    fetching.value = true
    fetchingId.value = id
    try {
      await couponApi.fetch({ id, pwd: password })
      if (disposed || account !== session.sessionRevision)
        return
      claimedIds.value = new Set([...Array.from(claimedIds.value), id])
      showPwdPop.value = false
      couponPwd.value = ''
      toast(t('coupons.Successfullyclaimed'))
      await onSuccess(id)
    }
    catch (error) {
      if (disposed || account !== session.sessionRevision)
        return
      const message = error instanceof Error ? error.message : '领取失败，请重试'
      const code = Number(message.match(/请求错误\[(\d+)\]/)?.[1])
      const key = couponFetchErrorKey(code)
      uni.showModal({ content: key ? t(key) : message, showCancel: false })
    }
    finally {
      if (!disposed && account === session.sessionRevision) {
        fetching.value = false
        fetchingId.value = null
      }
    }
  }
  function getCounpon(item: CouponTemplate) {
    if (disposed || fetching.value || item.claimed || claimedIds.value.has(item.id) || !requireIdentity('customer'))
      return
    couponPwd.value = ''
    if (item.pwd) {
      pwdCouponId = item.id
      showPwdPop.value = true
      return
    }
    return doFetch(item.id)
  }
  function getCounpon2() {
    if (!couponPwd.value.trim()) {
      toast(t('coupons.inputpassword'))
      return
    }
    if (pwdCouponId !== null)
      return doFetch(pwdCouponId)
  }
  return { showPwdPop, couponPwd, fetching, fetchingId, claimedIds, getCounpon, getCounpon2, closePwd: () => {
    if (!fetching.value)
      clear()
  } }
}
