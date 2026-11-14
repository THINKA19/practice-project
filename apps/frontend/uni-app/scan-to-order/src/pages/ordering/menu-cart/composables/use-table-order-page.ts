/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / composables/use-table-order-page.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - useCartTableOrderPage：本文件对外声明。
 * 【综合使用示例】
 * import { useCartTableOrderPage } from '@/pages/ordering/menu-cart/composables/use-table-order-page'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { useShopStore } from '@/pages/ordering/index'
/**
 * 扫码点餐已点菜品 ViewModel
 * 来源：bee-master/pages/cart/order.js fetchOrder / goPayOrder / paymentOk / paymentCancel
 */
import type { Order as TableOrder, OrderGoods as TableOrderGoods } from '@/pages/account/profile/order'
import type { NextAction } from '@/pages/ordering/menu-pay'
import { useOrderingLocale as useI18n } from '@/pages/ordering/menu'
import { requireIdentity } from '@/pages/auth/session'
import { orderApi } from '@/pages/account/profile/order'
import { setTitle } from '@/utils/project/interaction'
import { usePageLoading } from '@/hooks/project/usePageLoading'

/** nextAction type 9：扫码点餐桌台订单买单 */
const NEXT_ACTION_TABLE_ORDER = 9

/**
 * 创建当前桌台已点订单展示与付款交互状态。 无参数。
 * @returns 对象，包含 t、orderInfo、goodsList、paymentShow、paySuccess、money、nextAction、init、fetchOrder、goPayOrder、paymentOk、paymentCancel。
 * @example
 * import { useCartTableOrderPage } from '@/pages/ordering/menu-cart/composables/use-table-order-page'
 * useCartTableOrderPage() // => 对象，包含 t、orderInfo、goodsList、paymentShow、paySuccess、money、nextAction、init、fetchOrder、goPayOrder、paymentOk、paymentCancel
 */
export function useCartTableOrderPage() {
  const { t } = useI18n()

  const { loading, withLoading } = usePageLoading()
  const orderInfo = ref<TableOrder | null>(null)

  const goodsList = ref<TableOrderGoods[]>([])

  const paymentShow = ref(false)

  const paySuccess = ref(false)

  const money = ref(0)

  const nextAction = ref<NextAction>()

  const paying = ref(false)

  function init() {
    setTitle(t('cart.ordered'))
  }

  /** 当前桌台待支付订单（status=0 的第一条） */

  async function fetchOrder() {
    if (!requireIdentity('customer')) {
      orderInfo.value = null
      goodsList.value = []
      return
    }
    try {
      const res = await withLoading(() => orderApi.list({ status: 0 }))

      const table = useShopStore().scanDining
      const order = res.orderList.find(row => row.orderType === 'dinein' && (!table || Number(row.shopId) === Number(table.shopId)))

      orderInfo.value = null
      goodsList.value = []
      if (order) {
        orderInfo.value = order as TableOrder

        goodsList.value = (res.goodsMap[String(order.id)] || []) as TableOrderGoods[]
      }
    }
    catch {
    }
  }

  /**
   * 结账买单
   * token 需使用买单用户自己的 token，而不是当前餐桌的 token：
   * 用微信 code 静默注册/登录拿到用户 token，存为 payToken 供支付使用（不覆盖桌台会话）
   */

  async function goPayOrder() {
    if (paying.value || !orderInfo.value || !requireIdentity('customer'))
      return
    paying.value = true
    try {
      money.value = Number(orderInfo.value.amountReal) || 0
      nextAction.value = { type: 0, id: orderInfo.value.id }
      paymentShow.value = true
    }
    finally {
      paying.value = false
    }
  }

  function paymentOk() {
    paymentShow.value = false

    paySuccess.value = true
  }

  function paymentCancel() {
    paymentShow.value = false
  }

  return {
    t,
    orderInfo,
    loading,
    goodsList,
    paymentShow,
    paySuccess,
    money,
    nextAction,
    init,
    fetchOrder,
    goPayOrder,
    paymentOk,
    paymentCancel,
  }
}
