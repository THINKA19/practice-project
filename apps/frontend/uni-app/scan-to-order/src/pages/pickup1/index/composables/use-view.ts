import { PageState } from '@/components/page-state'
import { ClientRoutes } from '@/pages/routes'
import { navigate } from '@/utils/project/navigation'
import { ref, watch } from 'vue'
import { useOrderDetailData } from '../composables'
import { currentLocale, t } from '@/locale'

/** 页面状态与交互编排；每次调用拥有独立的页面实例。 */
export function useOrderDetailView() {
  const { scene, scenes, selectScene, loading, failed, orderId, money, paymentShow, paymentConfirm, orderDetail, shopSubdetail, fetchOrderDetail, toPayTap, callShop } = useOrderDetailData()
  /** 导航栏标题：definePage 里的是编译期静态兜底，这里按当前语言覆盖 */
  function setTitle() {
    uni.setNavigationBarTitle({ title: t('tabbar.pickup1') })
  }
  const pageVisible = ref(false)
  watch(currentLocale, () => {
    if (pageVisible.value)
      setTitle()
  })
  onHide(() => {
    pageVisible.value = false
  })
  onLoad(setTitle)
  // 用 onShow 而不是 onLoad：从支付页回来时订单状态已经变了，必须重新取一次
  onShow(() => {
    pageVisible.value = true
    setTitle()
    fetchOrderDetail()
  })
  return { PageState, ClientRoutes, navigate, t, scene, scenes, selectScene, loading, failed, orderId, money, paymentShow, paymentConfirm, orderDetail, shopSubdetail, fetchOrderDetail, toPayTap, callShop, setTitle, pageVisible }
}
