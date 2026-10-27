import { onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { toast } from '@/utils/project/feedback'
import { assetApi } from './use-requests'
import { isAssetDemo } from './use-context'
import { parseRechargeAmount } from '../domain/asset.rules'
import type { RechargeRule, UserAmount } from '../models/types'

export const CUSTOM_RULE_INDEX = -1

/** 维护钱包余额、充值草稿与确认锁；换号或销毁时清理状态，旧余额请求不能覆盖充值结果。 */
export function useAssetPage() {
  const { t } = useI18n()
  const session = useSessionState()
  const balance = ref('—')
  const freeze = ref('0.00')
  const rechargeSendRules = ref<RechargeRule[]>([])
  const ruleSelIndex = ref(0)
  const showRechargePop = ref(false)
  const amount2 = ref('')
  const paymentShow = ref(false)
  const money = ref(0)
  const paying = ref(false)
  const loading = ref(false)
  const loaded = ref(false)
  const failed = ref(false)
  const demo = isAssetDemo()
  let revision = 0
  let disposed = false
  let requestId = ''
  let pending: Promise<void> | null = null

  function applyAmount(data: UserAmount) {
    balance.value = data.balance.toFixed(2)
    freeze.value = data.freeze.toFixed(2)
  }
  function clear() {
    revision++
    balance.value = '—'
    freeze.value = '0.00'
    rechargeSendRules.value = []
    paymentShow.value = false
    showRechargePop.value = false
    amount2.value = ''
    ruleSelIndex.value = 0
    failed.value = false
    requestId = ''
    money.value = 0
    loading.value = false
    loaded.value = false
    paying.value = false
    pending = null
  }
  watch(() => session.sessionRevision, clear, { flush: 'sync' })
  onScopeDispose(() => {
    disposed = true
    clear()
  })

  function refresh(): Promise<void> {
    if (disposed)
      return Promise.resolve()
    session.updateNowTime()
    if ((!demo || session.identity) && !requireIdentity('customer')) {
      clear()
      return Promise.resolve()
    }
    if (pending)
      return pending
    const ticket = ++revision
    const account = session.sessionRevision
    loading.value = true
    failed.value = false
    pending = Promise.all([assetApi.amount(), assetApi.rechargeRules()]).then(([amount, rules]) => {
      if (disposed || ticket !== revision || account !== session.sessionRevision)
        return
      applyAmount(amount)
      const selectedId = rechargeSendRules.value[ruleSelIndex.value]?.id
      rechargeSendRules.value = rules
      if (ruleSelIndex.value !== CUSTOM_RULE_INDEX) {
        const selectedIndex = rules.findIndex(rule => rule.id === selectedId)
        ruleSelIndex.value = selectedIndex >= 0 ? selectedIndex : rules.length ? 0 : CUSTOM_RULE_INDEX
      }
      loaded.value = true
    }).catch(() => {
      if (!disposed && ticket === revision)
        failed.value = true
    }).finally(() => {
      if (!disposed && ticket === revision) {
        loading.value = false
        pending = null
      }
    })
    return pending
  }
  function changePersionNum(index: number) {
    ruleSelIndex.value = index
    amount2.value = ''
    if (index === CUSTOM_RULE_INDEX)
      showRechargePop.value = true
  }
  function openPayment(amount: number) {
    if (!demo) {
      toast('充值暂未开放')
      return
    }
    if (!requireIdentity('customer'))
      return
    money.value = amount
    requestId = `recharge-${Date.now()}-${Math.random().toString(36).slice(2)}`
    paymentShow.value = true
  }
  function submit1() {
    if (disposed || loading.value || paying.value)
      return
    const rule = rechargeSendRules.value[ruleSelIndex.value]
    if (ruleSelIndex.value === CUSTOM_RULE_INDEX || !rule) {
      amount2.value = ''
      showRechargePop.value = true
      return
    }
    openPayment(rule.confine)
  }
  function submit2() {
    if (disposed || paying.value)
      return
    const amount = parseRechargeAmount(amount2.value)
    if (amount === null) {
      toast(t('wallet.amountInvalid'))
      return
    }
    openPayment(amount)
  }
  async function paymentOk() {
    if (disposed || paying.value || !paymentShow.value || !requireIdentity('customer'))
      return
    const account = session.sessionRevision
    paying.value = true
    try {
      const result = await assetApi.recharge(money.value, requestId)
      if (disposed || account !== session.sessionRevision)
        return
      // 充值结果更新后，充值前发起的余额读取不能再覆盖新余额。
      revision++
      pending = null
      loading.value = false
      applyAmount(result)
      paymentShow.value = false
      showRechargePop.value = false
      toast('演示充值已完成')
    }
    catch (error) {
      if (!disposed && account === session.sessionRevision)
        toast(error instanceof Error ? error.message : '充值失败，请重试')
    }
    finally {
      if (!disposed && account === session.sessionRevision)
        paying.value = false
    }
  }
  return {
    balance,
    freeze,
    rechargeSendRules,
    ruleSelIndex,
    showRechargePop,
    amount2,
    paymentShow,
    money,
    paying,
    loading,
    loaded,
    failed,
    demo,
    init: () => uni.setNavigationBarTitle({ title: t('wallet.title') }),
    refresh,
    changePersionNum,
    submit1,
    submit2,
    paymentOk,
    onClose: () => { showRechargePop.value = false },
    paymentCancel: () => {
      if (!paying.value)
        paymentShow.value = false
    },
  }
}
