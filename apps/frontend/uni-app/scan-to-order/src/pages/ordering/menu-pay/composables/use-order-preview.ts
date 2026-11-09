/**
 * ============================================================================
 * 【文件概述】结算与支付 / composables/use-order-preview.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - PeisongFeeDetail：数据类型契约。
 * - OrderPreviewDeps：数据类型契约。
 * - usePayOrderPreview：本文件对外声明。
 * - OrderPreviewVm：数据类型契约。
 * 【综合使用示例】
 * import type { PeisongFeeDetail } from '@/pages/ordering/menu-pay/composables/use-order-preview'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useGoodsDraftStore } from '../store'
/**
 * 结算页 - 商品清单、下单参数组装与价格试算 ViewModel
 * 来源：bee-master/pages/pay/index.js processYunfei / createOrder（参数组装 + calculate=true 分支）
 */
import type { Ref } from 'vue'
import type { OrderPayload } from '../models/types'
import type { CardSelectVm } from './use-card-select'
import type { DeliveryVm } from './use-delivery'
import type { DiningTimeVm } from './use-dining-time'
import type { CartItem } from '@/pages/ordering/menu-cart'
import { toOrderGoodsJson } from '@/pages/ordering/menu-cart'
import { getSessionRevision } from '@/pages/auth/session'
import { orderApi } from '@/pages/account/profile/order'
import { toast } from '@/utils/project/interaction'
import { shopCheckoutReason } from '@/pages/ordering/index'
import { fullAddress } from '@/pages/account/profile/address'
import { internationalPhone, phoneCountryOf } from '@/utils/project/phone'

/**
 * 第三方配送服务费（试算返回）
 * 结构字段：amount1、amount2、amount3、fwf1Name、fwf2Name、fwf3Name；必填与可选字段见声明。
 * @example
 * import type { PeisongFeeDetail } from '@/pages/ordering/menu-pay/composables/use-order-preview'
 * declare const response: PeisongFeeDetail
 * const value: PeisongFeeDetail = response // => 保留 PeisongFeeDetail 的字段与取值约束
 */
export interface PeisongFeeDetail {
  amount1?: number
  amount2?: number
  amount3?: number
  fwf1Name?: string
  fwf2Name?: string
  fwf3Name?: string
  [k: string]: unknown
}

/**
 * OrderPreviewDeps 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：t、delivery、cards、diningTime、mobile、remark、query、onError；必填与可选字段见声明。
 * @example
 * import type { OrderPreviewDeps } from '@/pages/ordering/menu-pay/composables/use-order-preview'
 * declare const response: OrderPreviewDeps
 * const value: OrderPreviewDeps = response // => 保留 OrderPreviewDeps 的字段与取值约束
 */
export interface OrderPreviewDeps {
  t: (key: string) => string
  delivery: DeliveryVm
  cards: CardSelectVm
  diningTime: DiningTimeVm
  mobile: Ref<string>
  phoneCountry?: Ref<string>
  remark: Ref<string>
  /** 砍价 id、拼团团号（来自路由参数） */
  query: Ref<{ kjId?: string, pingtuanOpenId?: string }>
  /** 统一错误处理（含 2000 未登录重登） */
  onError: (e: unknown) => void
}

/**
 * 创建 use-order-preview 对应的领域状态与交互能力。
 * @param deps {OrderPreviewDeps} 调用方提供的状态与业务动作。
 * @returns 对象，包含 goodsList、goodsJsonStr、isNeedLogistics、totalScoreToPay、allGoodsNumber、allGoodsPrice、allGoodsAndYunPrice、yunPrice、peisongfee、amountReal、buildPayload、calculate、refreshPreview。
 * @example
 * import { usePayOrderPreview } from '@/pages/ordering/menu-pay/composables/use-order-preview'
 * declare const deps: Parameters<typeof usePayOrderPreview>[0]
 * usePayOrderPreview(deps) // => 对象，包含 goodsList、goodsJsonStr、isNeedLogistics、totalScoreToPay、allGoodsNumber、allGoodsPrice、allGoodsAndYunPrice、yunPrice、peisongfee、amountReal、buildPayload、calculate、refreshPreview
 */
export function usePayOrderPreview(deps: OrderPreviewDeps) {
  const { t, delivery, cards, diningTime, mobile, remark, query } = deps

  const goodsList = ref<CartItem[]>([])

  const goodsJsonStr = ref('')

  const isNeedLogistics = ref(false)

  const totalScoreToPay = ref(0)

  const allGoodsNumber = ref(0)

  const allGoodsPrice = ref(0)

  const allGoodsAndYunPrice = ref(0)

  const yunPrice = ref(0)

  const peisongfee = ref<PeisongFeeDetail | null>(null)

  const amountReal = ref(0)
  const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const errorMessage = ref('')
  const subtotal = computed(() => goodsList.value.reduce((sum, item) => sum + Math.round(item.price * 100) * item.number, 0) / 100)
  const quantity = computed(() => goodsList.value.reduce((sum, item) => sum + item.number, 0))

  /** 试算序号：只采用最后一次试算结果，避免并发试算乱序覆盖 */

  let calcSeq = 0
  /** 输入变化立即使旧报价失效，等待新试算；迟到响应不能恢复旧报价。 */
  function invalidate() {
    calcSeq++
    status.value = 'idle'
    errorMessage.value = ''
  }
  watch(() => JSON.stringify([getSessionRevision(), goodsList.value, delivery.shopInfo.value?.id, delivery.peisongType.value, delivery.curAddress.value, cards.curCard.value, delivery.packagingFeeUse.value, diningTime.diningTime.value]), invalidate, { flush: 'sync' })
  onScopeDispose(invalidate)

  /** 购物车商品 → goodsJsonStr（原 processYunfei），返回是否有可下单商品 */

  function buildGoodsJson(): boolean {
    if (goodsList.value.length === 0) {
      return false
    }

    const inviterId = useGoodsDraftStore().referrer || 0

    const { goods, isNeedLogistics: need } = toOrderGoodsJson(goodsList.value, inviterId)

    isNeedLogistics.value = need

    if (!goods.length)
      return false
    goodsJsonStr.value = JSON.stringify(goods)

    return true
  }

  /**
   * 组装下单参数（原 createOrder 前半段）
   * @param submit true 正式下单，false 试算
   * @returns null 表示校验未通过；正式提交弹提示，自动试算使用页面内错误
   */

  async function buildPayload(submit: boolean): Promise<OrderPayload | null> {
    const notify = (message: string) => {
      if (submit)
        toast(message)
      else
        errorMessage.value = message
    }
    const revision = calcSeq
    const shop = delivery.shopInfo.value

    const type = delivery.peisongType.value

    const addr = delivery.curAddress.value

    const payload: OrderPayload = {
      goodsJsonStr: goodsJsonStr.value,
      remark: remark.value,
      peisongType: type,
      isCanHx: true,
    }

    if (!shop) {
      notify('请先选择下单门店')
      return null
    }
    const blocked = shopCheckoutReason(shop)
    if (blocked) {
      notify(blocked)
      return null
    }
    if (goodsList.value.some(item => Number(item.shopId) !== shop.id)) {
      notify('商品不属于当前门店，请返回重新选择')
      return null
    }
    if (type === 'kd' ? !shop.openWaimai : !shop.openZiqu) {
      notify('当前门店暂不支持此取餐方式')
      return null
    }
    payload.shopIdZt = shop.id
    payload.shopNameZt = shop.name

    if (query.value.kjId) {
      payload.kjid = query.value.kjId
    }

    if (query.value.pingtuanOpenId) {
      payload.pingtuanOpenId = query.value.pingtuanOpenId
    }

    const extJson: Record<string, string> = { 结算方式: '现金结算', 计价国家: shop.countryCode || '', 门店名称: shop.name, 门店照片: shop.photos?.[0] || shop.pic || '' }

    if (type === 'zq') {
      if (mobile.value.trim()) {
        const phone = internationalPhone(mobile.value, deps.phoneCountry?.value ?? phoneCountryOf(mobile.value))
        if (!phone) {
          notify('请输入与所选区号匹配的联系电话')
          return null
        }
        extJson['联系电话'] = phone
      }

      if (delivery.packagingFee.value && delivery.packagingFeeUse.value === '1') {
        payload.trips = delivery.packagingFee.value
      }
    }

    if (diningTime.enabled.value) {
      extJson[type === 'zq' ? '取餐时间' : '送达时间'] = diningTime.diningTime.value
    }

    payload.extJsonStr = JSON.stringify(extJson)
    if (type === 'kd' && delivery.availabilityReason?.value) {
      notify(delivery.availabilityReason.value)
      return null
    }
    // 设置了配送费阶梯时按距离匹配

    const peisongFeeId = await delivery.resolvePeisongFeeId()

    if (peisongFeeId !== undefined) {
      payload.peisongFeeId = peisongFeeId
    }
    // 达达配送

    if (shop?.number && shop.expressType === 'dada' && type === 'kd') {
      if (!addr) {
        notify(t('pay.setaddress'))

        return null
      }

      payload.dadaShopNo = shop.number

      payload.lat = addr.latitude

      payload.lng = addr.longitude
    }

    if (type === 'kd') {
      if (!addr) {
        notify(t('pay.Receivingaddress'))

        return null
      }

      if (!addr.linkMan?.trim() || !addr.mobile?.trim() || !addr.address?.trim()) {
        notify('请完善收货人、联系电话和收货地址')
        return null
      }
      const phone = internationalPhone(addr.mobile, addr.phoneCountry || phoneCountryOf(addr.mobile))
      if (!phone) {
        notify('收货联系电话无效，请编辑收货地址')
        return null
      }
      payload.provinceId = addr.provinceId

      payload.cityId = addr.cityId

      if (addr.districtId) {
        payload.districtId = addr.districtId
      }

      payload.address = fullAddress(addr)

      payload.linkMan = addr.linkMan

      payload.mobile = phone

      payload.code = addr.code as string | undefined
    }

    if (cards.curCard.value) {
      payload.cardId = cards.curCard.value.id
    }

    if (!submit) {
      payload.calculate = 'true'
    }

    return revision === calcSeq ? payload : null
  }

  /** 价格试算（原 createOrder() 无参调用） */

  async function calculate() {
    const seq = ++calcSeq

    status.value = 'loading'
    errorMessage.value = ''
    yunPrice.value = 0
    peisongfee.value = null
    try {
      if (!buildGoodsJson()) {
        if (seq === calcSeq)
          status.value = 'idle'
        return
      }
      if (delivery.peisongType.value === 'kd' && (!delivery.curAddress.value || delivery.availabilityReason?.value)) {
        status.value = 'idle'
        return
      }
      const payload = await buildPayload(false)
      if (seq !== calcSeq)
        return
      if (!payload) {
        status.value = errorMessage.value ? 'error' : 'idle'
        return
      }
      const res = await orderApi.create(payload)

      if (seq !== calcSeq) {
        return
      }

      const validAmount = (value: unknown) => (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) && Number.isFinite(Number(value)) && Number(value) >= 0
      if (!validAmount(res.amountReal) || !validAmount(res.amountTotle)
        || (delivery.peisongType.value === 'kd' && !validAmount(res.amountLogistics))) {
        throw new Error('结算金额返回无效')
      }
      totalScoreToPay.value = Number(res.score) || 0

      allGoodsNumber.value = Number(res.goodsNumber) || 0

      allGoodsPrice.value = Number(res.amountTotle) || 0

      yunPrice.value = Number(res.amountLogistics) || 0

      allGoodsAndYunPrice.value = yunPrice.value + allGoodsPrice.value

      peisongfee.value = (res.peisongfee as PeisongFeeDetail | undefined) || null

      amountReal.value = Number(res.amountReal)
      status.value = 'ready'
    }
    catch (e) {
      if (seq === calcSeq) {
        status.value = 'error'
        errorMessage.value = '金额确认失败，请重试；确认成功后才能支付'
        deps.onError(e)
      }
    }
  }

  /** 商品变化后重新组装并试算（原 processYunfei → createOrder） */

  function refreshPreview() {
    return calculate()
  }

  return {
    goodsList,
    goodsJsonStr,
    isNeedLogistics,
    totalScoreToPay,
    allGoodsNumber,
    allGoodsPrice,
    allGoodsAndYunPrice,
    yunPrice,
    peisongfee,
    amountReal,
    invalidate,
    status,
    errorMessage,
    subtotal,
    quantity,
    buildPayload,
    calculate,
    refreshPreview,
  }
}

/**
 * OrderPreviewVm 数据契约；字段可选性及取值范围以声明为准。
 * 值约束：ReturnType<typeof usePayOrderPreview>。
 * @example
 * import type { OrderPreviewVm } from '@/pages/ordering/menu-pay/composables/use-order-preview'
 * declare const response: OrderPreviewVm
 * const value: OrderPreviewVm = response // => 保留 OrderPreviewVm 的字段与取值约束
 */
export type OrderPreviewVm = ReturnType<typeof usePayOrderPreview>
