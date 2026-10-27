import type { OrderDetailData, PickupDemoScene, ShopSubItem } from '../models/types'
import { computed, onScopeDispose, ref } from 'vue'
import { orderDetailApi } from '../api/orders.api'
import { PICKUP_DEMO_SCENES } from '../models/enums'
import { t } from '@/locale'
import { toast } from '@/utils/project/feedback'

/** 取餐一是独立测试页，只请求演示接口，不选择当前顾客的正式订单。 */
export function useOrderDetailData() {
  const scene = ref<PickupDemoScene>('pickup')
  const scenes = PICKUP_DEMO_SCENES
  const orderDetail = ref<OrderDetailData | null>(null)
  const shopSubdetail = ref<ShopSubItem | null>(null)
  const loading = ref(false)
  const failed = ref(false)
  const paymentShow = ref(false)
  const paying = ref(false)
  const money = computed(() => orderDetail.value?.orderInfo.amountReal ?? 0)
  const orderId = computed(() => orderDetail.value?.orderInfo.id ?? null)
  let revision = 0
  let disposed = false
  onScopeDispose(() => {
    disposed = true
    revision++
  })
  async function fetchOrderDetail() {
    if (disposed || paying.value)
      return
    const request = ++revision
    loading.value = true
    failed.value = false
    orderDetail.value = null
    shopSubdetail.value = null
    try {
      const detail = await orderDetailApi.preview(scene.value)
      if (request !== revision)
        return
      orderDetail.value = detail
      if (detail?.orderInfo.shopIdZt) {
        try {
          const shop = await orderDetailApi.shop(detail.orderInfo.shopIdZt)
          if (request === revision)
            shopSubdetail.value = shop
        }
        catch { /* 门店信息失败不遮挡已获取的订单。 */ }
      }
    }
    catch {
      if (request === revision)
        failed.value = true
    }
    finally {
      if (request === revision)
        loading.value = false
    }
  }
  function selectScene(value: PickupDemoScene) {
    if (paying.value)
      return
    scene.value = value
    paymentShow.value = false
    return fetchOrderDetail()
  }
  function toPayTap() {
    if (!loading.value && !paying.value && orderDetail.value?.orderInfo.status === 0)
      paymentShow.value = true
  }
  async function paymentConfirm() {
    if (disposed || paying.value || loading.value || orderDetail.value?.orderInfo.status !== 0)
      return
    const request = revision
    paying.value = true
    paymentShow.value = false
    try {
      const detail = await orderDetailApi.demoPay()
      if (request !== revision)
        return
      scene.value = 'pickup'
      orderDetail.value = detail
      toast(t('pickupPreview.demoPaid'))
    }
    catch { /* 请求失败保留待付款状态，可重试。 */ }
    finally { paying.value = false }
  }
  function callShop() {
    const phoneNumber = shopSubdetail.value?.info.linkPhone
    if (phoneNumber)
      uni.makePhoneCall({ phoneNumber })
  }
  return { scene, scenes, selectScene, loading, failed, paying, orderId, money, paymentShow, paymentConfirm, orderDetail, shopSubdetail, fetchOrderDetail, toPayTap, callShop }
}
