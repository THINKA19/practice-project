import { ref, watch } from 'vue'
import { useScanResultDetail } from '../composables'
import { currentLocale, t } from '@/locale'
import { ClientRoutes } from '@/pages/routes'

/** 页面状态与交互编排；每次调用拥有独立的页面实例。 */
export function useScanResultView() {
  const { demo, permissionDenied, hxNumber, orderDetail, canHx, loading, failed, verified, submitting, init, fetchOrderDetail, doneHx } = useScanResultDetail()
  /** 返回已有列表触发 onShow 刷新；直接打开核销链接时替换当前页。 */
  function returnToList() {
    const pages = getCurrentPages()
    const url = ClientRoutes.Pickup.listDemo
    if (pages[pages.length - 2]?.route === url.slice(1))
      uni.navigateBack({ fail: () => uni.redirectTo({ url }) })
    else
      uni.redirectTo({ url })
  }
  /** 导航栏标题：definePage 里的是编译期静态兜底，这里按当前语言覆盖 */
  function setTitle() {
    uni.setNavigationBarTitle({ title: t('orderScan.title') })
  }
  const pageVisible = ref(false)
  watch(currentLocale, () => {
    if (pageVisible.value)
      setTitle()
  })
  onHide(() => {
    pageVisible.value = false
  })
  onLoad((query) => {
    setTitle()
    init(query)
  })
  // 用 onShow 而不是 onLoad：扫码回来时核销码已经变了，要重新取对应订单
  onShow(() => {
    pageVisible.value = true
    setTitle()
    fetchOrderDetail()
  })
  return { t, demo, permissionDenied, hxNumber, orderDetail, canHx, loading, failed, verified, submitting, init, fetchOrderDetail, doneHx, returnToList, setTitle, pageVisible }
}
