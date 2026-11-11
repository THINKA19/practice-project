import { useI18n } from 'vue-i18n'
import { usePagingView } from '@/hooks/project/usePagingView'
import { COUPON_PAGE_SIZE, CouponTab, useCouponPage } from './use-page'

/** 将券列表接入 z-paging，并注册页面刷新和分享生命周期。 */
export function useCouponView() {
  const { t } = useI18n()
  const vm = useCouponPage()
  const { tabs, activeIndex, templates, mine } = vm
  const { showPwdPop, couponPwd, fetching, fetchingId } = vm.fetch
  const { number, pwd, exchanging } = vm.exchange
  const { paging, query, reload } = usePagingView(vm, () => activeIndex.value === CouponTab.CLAIMABLE ? templates.value : mine.value)
  async function changeTab(index: number) {
    if (await vm.tabClick(index, false))
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
  return {
    COUPON_PAGE_SIZE,
    CouponTab,
    t,
    vm,
    tabs,
    activeIndex,
    templates,
    mine,
    showPwdPop,
    couponPwd,
    fetching,
    fetchingId,
    number,
    pwd,
    exchanging,
    paging,
    query,
    changeTab,
  }
}
