/** 会员码页面装配：账户资料复用会员中心，动态码和生命周期归本模块。 */
import { onScopeDispose, ref, watch } from 'vue'
import { useSessionState } from '@/pages/auth/session'
import { useMemberCenterAccount } from '../../member-center'
import { memberCodeApi } from './use-requests'
import type { MemberCode, MemberCodeStatus } from '../models/types'

/**
 * 装配会员码页面，适用于 uni-app 页面作用域；不持久化动态码。
 * @returns 账户视图、动态码状态与刷新/隐藏动作；onShow 调用 refresh，onHide 调用 suspend。
 * @example const vm = useUserCodePage()
 */
export function useUserCodePage() {
  const account = useMemberCenterAccount()
  const session = useSessionState()
  const memberCode = ref<MemberCode | null>(null)
  const codeStatus = ref<MemberCodeStatus>('idle')
  let generation = 0
  let disposed = false
  let pending: Promise<void> | null = null
  let timer: ReturnType<typeof setTimeout> | null = null

  function suspend() {
    generation++
    pending = null
    memberCode.value = null
    codeStatus.value = 'idle'
    if (timer)
      clearTimeout(timer)
    timer = null
  }
  watch(() => [session.sessionRevision, session.hasLogin, session.identity], suspend, { flush: 'sync' })
  onScopeDispose(() => {
    disposed = true
    suspend()
  })

  function refreshCode(): Promise<void> {
    if (disposed)
      return Promise.resolve()
    if (!account.user.value) {
      suspend()
      return Promise.resolve()
    }
    if (!memberCodeApi.available) {
      suspend()
      codeStatus.value = 'unavailable'
      return Promise.resolve()
    }
    if (pending)
      return pending
    suspend()
    const ticket = generation
    const current = () => !disposed && ticket === generation
    codeStatus.value = 'loading'
    pending = memberCodeApi.dynamic().then((data) => {
      if (!current())
        return
      const remaining = data.expiresAt - Date.now()
      if (remaining <= 0) {
        codeStatus.value = 'expired'
        return
      }
      memberCode.value = data
      codeStatus.value = 'ready'
      timer = setTimeout(() => {
        memberCode.value = null
        codeStatus.value = 'expired'
        timer = null
      }, remaining)
    }).catch(() => {
      if (current())
        codeStatus.value = 'error'
    }).finally(() => {
      if (current())
        pending = null
    })
    return pending
  }

  async function refresh() {
    // 资产刷新先更新会话时间，避免到期会话继续展示动态码。
    const assets = account.refresh()
    await Promise.all([assets, refreshCode()])
  }

  return { ...account, memberCode, codeStatus, refresh, suspend }
}
