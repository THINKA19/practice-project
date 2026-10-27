/**
 * 优惠券：可领 / 已领 / 失效 / 口令兑换
 */
import { useI18n } from 'vue-i18n'
import { usePagingView } from '@/hooks/project/usePagingView'
import { COUPON_TAB_EXCHANGE, useCouponPage } from './use-page'

/** 页面状态与交互编排；每次调用拥有独立的页面实例。 */
export function useCouponView() {
  const { t } = useI18n()
  const vm = useCouponPage()
  const { tabs, activeIndex, templates, mine } = vm
  const { showPwdPop, couponPwd, fetchingId, claimedIds } = vm.fetch
  const { number, pwd, exchangeCouponsLoading } = vm.exchange
  const { paging, query, reload } = usePagingView(vm, () => activeIndex.value === 0 ? templates.value : mine.value)
  async function changeTab(index: number) {
    await vm.tabClick(index, false)
    await reload()
  }
  onLoad(() => {
    vm.init()
  })
  onShow(() => {
    reload()
  })
  onShareAppMessage(() => vm.shareAppMessage())
  onShareTimeline(() => vm.shareTimeline())
  return { COUPON_TAB_EXCHANGE, t, vm, tabs, activeIndex, templates, mine, showPwdPop, couponPwd, fetchingId, claimedIds, number, pwd, exchangeCouponsLoading, paging, query, reload, changeTab }
}
