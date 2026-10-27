import { computed, onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { navigate } from '@/utils/project/navigation'
import { toast } from '@/utils/project/feedback'
import { ClientRoutes } from '@/pages/routes'
import { isAssetDemo } from './use-context'
import { couponApi } from './use-requests'
import type { CouponTemplate, MyCoupon } from '../models/types'
import { couponDateOnly } from '../domain/coupons.rules'
import { MyCouponStatus } from '../models/enums'
import { useCouponFetch } from './use-fetch'
import { useCouponExchange } from './use-exchange'

export const COUPON_TAB_EXCHANGE = 3
/** 组装券模板、我的券分页与领取/兑换流程；切换标签或账号时使旧列表请求失效。 */
export function useCouponPage() {
  const { t, tm } = useI18n()
  const session = useSessionState()
  const tabs = computed(() => tm('coupons.tabs') as string[])
  const activeIndex = ref(0)
  const templates = ref<CouponTemplate[]>([])
  const mine = ref<MyCoupon[]>([])
  const loading = ref(false)
  const finished = ref(false)
  const loaded = ref(false)
  const failed = ref(false)
  let page = 0
  let revision = 0
  let disposed = false
  function clear() {
    revision++
    templates.value = []
    mine.value = []
    page = 0
    loading.value = false
    loaded.value = false
    failed.value = false
    finished.value = false
  }
  watch(() => session.sessionRevision, clear, { flush: 'sync' })
  onScopeDispose(() => {
    disposed = true
    clear()
  })
  async function load(reset: boolean) {
    if (disposed || activeIndex.value === COUPON_TAB_EXCHANGE || (!reset && (loading.value || finished.value)))
      return
    session.updateNowTime()
    if (activeIndex.value !== 0 && (!isAssetDemo() || session.identity) && !requireIdentity('customer')) {
      clear()
      return
    }
    if (reset)
      clear()
    const ticket = ++revision
    const tab = activeIndex.value
    const account = session.sessionRevision
    const next = page + 1
    loading.value = true
    failed.value = false
    const current = () => !disposed && ticket === revision && tab === activeIndex.value && account === session.sessionRevision
    try {
      const params = { page: next, pageSize: 15 }
      if (tab === 0) {
        const result = await couponApi.templates(params)
        if (!current())
          return
        templates.value = reset ? result.list : [...templates.value, ...result.list]
        finished.value = result.list.length === 0 || (result.total !== undefined ? templates.value.length >= result.total : result.list.length < 15)
      }
      else {
        const result = await couponApi.my({ ...params, status: tab === 1 ? MyCouponStatus.USABLE : MyCouponStatus.USED_OR_INVALID })
        if (!current())
          return
        const rows = result.list.map(item => ({ ...item, dateEnd: couponDateOnly(item.dateEnd) }))
        mine.value = reset ? rows : [...mine.value, ...rows]
        finished.value = result.list.length === 0 || (result.total !== undefined ? mine.value.length >= result.total : result.list.length < 15)
      }
      page = next
    }
    catch {
      if (current())
        failed.value = true
    }
    finally {
      if (current()) {
        loading.value = false
        loaded.value = true
      }
    }
  }
  const refresh = () => load(true)
  const fetch = useCouponFetch(async (id) => {
    templates.value = templates.value.map(item => item.id === id ? { ...item, claimed: true } : item)
  })
  const exchange = useCouponExchange(async () => {})
  async function tabClick(index: number, refreshList = true) {
    if (!Number.isInteger(index) || index < 0 || index > 3)
      return
    activeIndex.value = index
    clear()
    if (refreshList)
      await refresh()
  }
  async function touse(item: MyCoupon) {
    if (disposed || !requireIdentity('customer'))
      return
    const account = session.sessionRevision
    try {
      const detail = await couponApi.detail(item.pid)
      if (disposed || account !== session.sessionRevision)
        return
      const result = detail.couponRefs?.length
        ? await navigate(ClientRoutes.Ordering.shopSelect, { peisongType: 'zq' })
        : await navigate(ClientRoutes.Ordering.order)
      if (!result.ok)
        toast(t('common.navigationFailed'))
    }
    catch (error) {
      if (!disposed && account === session.sessionRevision)
        toast(error instanceof Error ? error.message : '暂时无法使用优惠券')
    }
  }
  const shareQuery = () => session.hasLogin && session.identity === 'customer' ? `inviter_id=${encodeURIComponent(session.userInfo.userId)}` : ''
  return {
    scopeKey: () => session.sessionRevision,
    tabs,
    activeIndex,
    templates,
    mine,
    loading,
    finished,
    loaded,
    failed,
    fetch,
    exchange,
    isEmpty: computed(() => loaded.value && !loading.value && !failed.value && activeIndex.value !== 3
      && (activeIndex.value === 0 ? !templates.value.length : !mine.value.length)),
    init: () => uni.setNavigationBarTitle({ title: t('coupons.title') }),
    refresh,
    tabClick,
    touse,
    pullDownRefresh: refresh,
    loadMore: () => load(false),
    shareAppMessage: () => ({ title: t('coupons.Invitingcoupons'), path: `${ClientRoutes.Account.coupons}?${shareQuery()}` }),
    shareTimeline: () => ({ title: t('coupons.Invitingcoupons'), query: shareQuery() }),
  }
}
