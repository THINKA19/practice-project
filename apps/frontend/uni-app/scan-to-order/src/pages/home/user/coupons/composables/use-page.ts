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

export const CouponTab = {
  CLAIMABLE: 0,
  USABLE: 1,
  INACTIVE: 2,
  EXCHANGE: 3,
} as const

export const COUPON_PAGE_SIZE = 15

function isLastPage(received: number, loaded: number, total?: number) {
  return received === 0 || (total === undefined ? received < COUPON_PAGE_SIZE : loaded >= total)
}

/** 组装券模板、我的券分页与领取/兑换流程；切换标签或账号时使旧列表请求失效。 */
export function useCouponPage() {
  const { t, tm } = useI18n()
  const session = useSessionState()
  const tabs = computed(() => tm('coupons.tabs') as string[])
  const activeIndex = ref<number>(CouponTab.CLAIMABLE)
  const templates = ref<CouponTemplate[]>([])
  const mine = ref<MyCoupon[]>([])
  const loading = ref(false)
  const finished = ref(false)
  const failed = ref(false)
  let page = 0
  let revision = 0
  let disposed = false
  function resetList() {
    revision++
    templates.value = []
    mine.value = []
    page = 0
    loading.value = false
    failed.value = false
    finished.value = false
  }
  watch(() => session.sessionRevision, resetList, { flush: 'sync' })
  onScopeDispose(() => {
    disposed = true
    resetList()
  })
  async function load(reset: boolean) {
    if (disposed || (!reset && (loading.value || finished.value)))
      return
    if (activeIndex.value === CouponTab.EXCHANGE) {
      // 分页组件重载时仍会发出查询；兑换页返回空结果并结束分页。
      finished.value = true
      return
    }
    session.updateNowTime()
    if (activeIndex.value !== CouponTab.CLAIMABLE && (!isAssetDemo() || session.identity) && !requireIdentity('customer')) {
      resetList()
      return
    }
    if (reset)
      resetList()
    const ticket = revision
    const tab = activeIndex.value
    const account = session.sessionRevision
    const next = page + 1
    loading.value = true
    failed.value = false
    const current = () => !disposed && ticket === revision && tab === activeIndex.value && account === session.sessionRevision
    try {
      const params = { page: next, pageSize: COUPON_PAGE_SIZE }
      if (tab === CouponTab.CLAIMABLE) {
        const result = await couponApi.templates(params)
        if (!current())
          return
        templates.value = reset ? result.list : [...templates.value, ...result.list]
        finished.value = isLastPage(result.list.length, templates.value.length, result.total)
      }
      else {
        const result = await couponApi.my({ ...params, status: tab === CouponTab.USABLE ? MyCouponStatus.USABLE : MyCouponStatus.USED_OR_INVALID })
        if (!current())
          return
        const rows = result.list.map(item => ({ ...item, dateEnd: couponDateOnly(item.dateEnd) }))
        mine.value = reset ? rows : [...mine.value, ...rows]
        finished.value = isLastPage(result.list.length, mine.value.length, result.total)
      }
      page = next
    }
    catch {
      if (current())
        failed.value = true
    }
    finally {
      if (current())
        loading.value = false
    }
  }
  const refresh = () => load(true)
  const fetch = useCouponFetch()
  const exchange = useCouponExchange()
  async function tabClick(index: number, refreshList = true) {
    if (!Number.isInteger(index) || index < CouponTab.CLAIMABLE || index > CouponTab.EXCHANGE || index === activeIndex.value)
      return false
    activeIndex.value = index
    resetList()
    if (refreshList)
      await load(false)
    return true
  }
  async function openCouponOrdering(item: MyCoupon) {
    if (disposed || activeIndex.value !== CouponTab.USABLE || !requireIdentity('customer'))
      return
    const account = session.sessionRevision
    const ticket = revision
    const current = () => !disposed && account === session.sessionRevision && ticket === revision
    try {
      const detail = await couponApi.detail(item.pid)
      if (!current())
        return
      const result = detail.couponRefs?.length
        ? await navigate(ClientRoutes.Ordering.shops, { peisongType: 'zq' })
        : await navigate(ClientRoutes.Ordering.order)
      if (!result.ok && current())
        toast(t('common.navigationFailed'))
    }
    catch (error) {
      if (current())
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
    failed,
    fetch,
    exchange,
    init: () => uni.setNavigationBarTitle({ title: t('coupons.title') }),
    refresh,
    tabClick,
    openCouponOrdering,
    loadMore: () => load(false),
    shareAppMessage: () => {
      const query = shareQuery()
      return { title: t('coupons.Invitingcoupons'), path: query ? `${ClientRoutes.Home.coupons}?${query}` : ClientRoutes.Home.coupons }
    },
    shareTimeline: () => ({ title: t('coupons.Invitingcoupons'), query: shareQuery() }),
  }
}
