import { useOrderingCurrency, useShopStore } from '@/pages/ordering/index'
import { computed, ref, watch } from 'vue'
/**
 * ============================================================================
 * 【文件概述】结算与支付 / composables/use-page.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - usePayPage：本文件对外声明。
 * 【综合使用示例】
 * import { usePayPage } from '@/pages/ordering/menu-pay/composables/use-page'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { useGoodsDraftStore } from '../store'
import { needsLogin, useOrderingLocale as useI18n } from '@/pages/ordering/menu'
import type { PayPageQuery } from '../models/types'
/**
 * 结算页 ViewModel（装配各职责 composable + 用户信息/手机号 + 生命周期动作）
 * 来源：bee-master/pages/pay/index.js onLoad / onShow / doneShow / initShippingAddress /
 *      processGotUserDetail / getPhoneNumber / updateUserInfo / remarkChange
 */
import type { CartItem } from '@/pages/ordering/menu-cart'
import type { MyCard } from '@/pages/home/service/gift-card'
import type { PeisongType } from '@/pages/ordering/index'
import { usePayPickupContact } from './use-pickup-contact'
import { usePayCardSelect } from './use-card-select'
import { usePayDelivery } from './use-delivery'
import { usePayDiningTime } from './use-dining-time'
import { usePayOrderPreview } from './use-order-preview'
import { usePaySubmitOrder } from './use-submit-order'
import { cashSettlementNotice } from '../domain/payment.rules'
import { useCartStore } from '@/pages/ordering/menu-cart'
import { getSessionRevision, refreshUserInfo, requireIdentity, useSessionState } from '@/pages/auth/session'
import { setTitle, showError, toast } from '@/utils/project/interaction'
import { navigate as go } from '@/utils/project/navigation'

import { ClientRoutes } from '@/pages/routes'

/**
 * 绑定手机号返回码：需要重新授权登录
 * @returns 对象，包含 t、wxlogin、nick、avatarUrl、mobile、remark、delivery、diningTime、cards、preview、submit、profileReady、belowMinAmount、submitButtonText、init、refresh、selectPeisongType、selectCard、setPackagingFeeUse、updateUserInfo。
 * @example
 * import { usePayPage } from '@/pages/ordering/menu-pay/composables/use-page'
 * usePayPage() // => 对象，包含 t、wxlogin、nick、avatarUrl、mobile、remark、delivery、diningTime、cards、preview、submit、profileReady、belowMinAmount、submitButtonText、init、refresh、selectPeisongType、selectCard、setPackagingFeeUse、updateUserInfo
 */

export function usePayPage() {
  const { formatPrice } = useOrderingCurrency()
  const { t } = useI18n()

  const session = useSessionState()

  const query = ref<PayPageQuery>({})

  const orderType = computed(() => query.value.orderType || '')

  const wxlogin = ref(true)

  const nick = ref('')

  const avatarUrl = ref('')

  const { mobile, phoneCountry, contactSource, contactLoading, contactError, loadContact } = usePayPickupContact()

  const remark = ref('')
  const goodsError = ref(false)
  /** 预取的微信登录 code（绑定手机号用） */

  /** 统一错误处理：未登录则重新登录后刷新页面数据，其余弹出接口信息 */

  async function onError(e: unknown) {
    toast('订单处理失败，请重试或查询订单状态')
    if (needsLogin(e))
      requireIdentity('customer')
  }

  const delivery = usePayDelivery(t)

  const diningTime = usePayDiningTime()

  const cards = usePayCardSelect()

  const preview = usePayOrderPreview({ t, delivery, cards, diningTime, mobile, phoneCountry, remark, query, onError: (e) => {
    if (needsLogin(e))
      requireIdentity('customer')
  } })

  watch(diningTime.diningTime, () => {
    void preview.calculate()
  })

  const submit = usePaySubmitOrder({ t, delivery, diningTime, preview, mobile, orderType, onError })

  function processGotUserDetail() {
    const user = session.userInfo
    nick.value = user.nickname || ''
    avatarUrl.value = user.avatar || ''
  }
  // 对应原 getApp().getUserDetailOK 回调：用户信息更新时同步

  watch(() => session.userInfo, processGotUserDetail)

  /** 读取默认地址 → 组装商品 → 试算（原 initShippingAddress + processYunfei） */

  async function initShippingAddress() {
    try {
      if (delivery.peisongType.value === 'kd')
        await Promise.all([delivery.loadDefaultAddress(), delivery.loadPeisongFeeList()])
      else
        void loadContact()
    }
    catch (e) {
      if (needsLogin(e)) {
        return onError(e)
      }
    }

    await preview.refreshPreview()
  }

  /** 登录后加载商品、地址、会员卡（原 doneShow） */

  async function doneShow() {
    const revision = getSessionRevision()
    const shopId = delivery.shopInfo.value?.id
    const current = () => revision === getSessionRevision() && shopId === delivery.shopInfo.value?.id
    goodsError.value = false
    let goods: CartItem[] = []

    if (orderType.value === 'buyNow') {
      goods = useGoodsDraftStore().buyNowGoods || []
    }
    else {
      try {
        const cart = await useCartStore().refresh(true)

        goods = cart?.items || []
      }
      catch (e) {
        if (!current())
          return
        goodsError.value = true
        if (needsLogin(e)) {
          return onError(e)
        }
      }
    }

    if (!current())
      return
    preview.goodsList.value = Array.isArray(goods) ? goods : []

    await initShippingAddress()

    cards.loadCardList()
  }

  /** onLoad */

  function init(q: PayPageQuery = {}) {
    setTitle(t('pay.title'))

    query.value = {
      orderType: q.orderType,
      pingtuanOpenId: q.pingtuanOpenId,
      kjId: q.kjId,
    }

    processGotUserDetail()

    refreshUserInfo().catch(showError)
  }

  /** onShow */

  async function refresh() {
    if (useShopStore().isScanMode) {
      await go(ClientRoutes.Ordering.cart)
      return
    }
    preview.invalidate()
    delivery.syncShopAndType()

    wxlogin.value = requireIdentity('customer')

    if (wxlogin.value) {
      await doneShow()
    }
  }

  /** 切换自取/外卖后重新试算（原 selected） */

  async function selectPeisongType(type: PeisongType) {
    if (!delivery.selectPeisongType(type))
      return
    preview.invalidate()
    await initShippingAddress()
  }

  /** 选择会员卡后重新试算（原 selectCard） */

  function selectCard(card: MyCard | null) {
    cards.selectCard(card)

    preview.calculate()
  }

  /** 保温袋需要/不需要（原 packaging_fee_Change / packaging_fee_Click） */

  function setPackagingFeeUse(v: '1' | '2') {
    delivery.setPackagingFeeUse(v)

    preview.calculate()
  }

  /**
   * 未完善头像昵称时的「授权登陆」
   * 原实现使用已废弃的 wx.getUserProfile（shared/platform 未提供），改为跳转「我的」页完善头像昵称，返回后 onShow 刷新
   */

  function updateUserInfo() {
    toast(t('pay.memberinformation'))

    go(ClientRoutes.Account.my)
  }

  /** 是否已完善头像昵称（决定底部按钮是下单还是授权） */

  const profileReady = computed(() => !!(nick.value && avatarUrl.value))

  /** 外卖未达起送价 */

  const belowMinAmount = computed(() =>
    delivery.peisongType.value === 'kd'
    && preview.status.value === 'ready'
    && preview.allGoodsPrice.value < Number(delivery.shopInfo.value?.serviceAmountMin || 0),
  )

  const needsAddress = computed(() => delivery.peisongType.value === 'kd'
    && !delivery.addressLoading.value && !delivery.addressError.value && !delivery.curAddress.value)
  const settlementNotice = computed(() => cashSettlementNotice(delivery.peisongType.value))
  const canResolveCheckout = computed(() => needsAddress.value || !!delivery.deliveryIssue.value
    || delivery.addressError.value || delivery.feeError.value || preview.status.value === 'error')
  const deliveryFeeText = computed(() => {
    if (delivery.addressLoading.value)
      return '计算中…'
    if (!delivery.curAddress.value)
      return '选择地址后计算'
    if (delivery.deliveryIssue.value?.kind === 'range')
      return '不支持配送'
    if (delivery.deliveryIssue.value)
      return '暂未计算'
    if (delivery.addressError.value || delivery.feeError.value || preview.status.value === 'error')
      return '计算失败'
    return '计算中…'
  })
  const amountHint = computed(() => {
    if (preview.status.value === 'ready')
      return undefined
    if (delivery.peisongType.value === 'kd')
      return preview.status.value === 'loading' ? '配送费计算中…' : '配送费未计入'
    return preview.status.value === 'error' ? '核价失败' : '核价中…'
  })
  function submitCheckout() {
    const issue = delivery.deliveryIssue.value
    if (issue?.kind === 'address')
      delivery.goAddress(true)
    else if (needsAddress.value || issue?.kind === 'range')
      delivery.goAddress()
    else if (issue?.kind === 'shop')
      delivery.goShopDetail()
    else if (issue || delivery.addressError.value || (delivery.feeError.value && preview.status.value !== 'ready'))
      void refresh()
    else if (preview.status.value === 'error')
      void preview.refreshPreview()
    else
      void submit.goCreateOrder()
  }
  const submitButtonText = computed(() => {
    if (submit.checkoutReason.value)
      return '暂不可结算'
    if (needsAddress.value)
      return '选择收货地址'
    if (delivery.deliveryIssue.value)
      return delivery.deliveryIssue.value.actionText
    if (delivery.addressError.value || (delivery.feeError.value && preview.status.value !== 'ready') || preview.status.value === 'error')
      return '重新计算'
    if (preview.status.value !== 'ready')
      return '金额计算中'
    return belowMinAmount.value
      ? `${formatPrice(delivery.shopInfo.value?.serviceAmountMin)}${t('pay.qisong')}`
      : submit.submitLoading.value ? '正在提交…' : '提交订单'
  })

  return {
    t,
    wxlogin,
    nick,
    avatarUrl,
    mobile,
    phoneCountry,
    contactSource,
    contactLoading,
    contactError,
    loadContact,
    remark,
    goodsError,
    delivery,
    diningTime,
    cards,
    preview,
    submit,
    profileReady,
    belowMinAmount,
    needsAddress,
    settlementNotice,
    amountHint,
    canResolveCheckout,
    deliveryFeeText,
    submitCheckout,
    submitButtonText,
    init,
    refresh,
    selectPeisongType,
    selectCard,
    setPackagingFeeUse,
    updateUserInfo,
  }
}
