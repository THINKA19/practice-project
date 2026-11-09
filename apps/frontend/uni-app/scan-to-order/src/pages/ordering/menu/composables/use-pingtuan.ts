/**
 * ============================================================================
 * 【文件概述】菜单选品 / composables/use-pingtuan.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - PingtuanEnterResult：数据类型契约。
 * - PingtuanOptions：数据类型契约。
 * - useOrderingPingtuan：本文件对外声明。
 * 【综合使用示例】
 * import type { PingtuanEnterResult } from '@/pages/ordering/menu/composables/use-pingtuan'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
import { buildAdditionPayload, buildSkuPayload } from '../domain/catalog.rules'
import { pingtuanApi } from '../api/pingtuan.api'
import { pingtuanAvatars } from '../domain/promotions.rules'
import { useGoodsDraftStore } from '@/pages/ordering/menu-pay'
import { needsLogin } from '../adapters/errors.adapter'
import { useOrderingLocale as useI18n } from './use-locale'
import type { SkuPopupVm } from './use-sku-popup'
import type { GoodsDetail, PingtuanSet } from '../models/goods.types'
import { computed, ref } from 'vue'
import { showError, toast } from '@/utils/project/interaction'
import { navigate as go } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'
import { useShopCheckoutAvailability } from '@/pages/ordering/index'
/**
 * 点餐页 - 拼团弹层 ViewModel
 * 来源：bee-master/pages/index/index.js _showGoodsDetailPOP(拼团部分)/yuanjiagoumai/_lijipingtuanbuy/
 *       _lijipingtuanbuy2/pingtuanbuy 以及 onShareAppMessage 的拼团分享参数
 */

/**
 * enter 的结果：pingtuan 已弹出拼团层 / detail 应改为弹出规格层 / abort 中止
 * 值约束：'pingtuan' | 'detail' | 'abort'。
 * @example
 * import type { PingtuanEnterResult } from '@/pages/ordering/menu/composables/use-pingtuan'
 * declare const response: PingtuanEnterResult
 * const value: PingtuanEnterResult = response // => 保留 PingtuanEnterResult 的字段与取值约束
 */
export type PingtuanEnterResult = 'pingtuan' | 'detail' | 'abort'

/**
 * PingtuanOptions 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：sku、onNeedLogin、onReopen；必填与可选字段见声明。
 * @example
 * import type { PingtuanOptions } from '@/pages/ordering/menu/composables/use-pingtuan'
 * declare const response: PingtuanOptions
 * const value: PingtuanOptions = response // => 保留 PingtuanOptions 的字段与取值约束
 */
export interface PingtuanOptions {
  sku: SkuPopupVm
  onNeedLogin: () => void
  /** 重新开团：重新打开该商品 */
  onReopen: (goodsId: number) => void
}

/**
 * 创建 use-pingtuan 对应的领域状态与交互能力。
 * @param options {PingtuanOptions} 调用配置及依赖能力。
 * @returns 对象，包含 visible、setting、openId、numberOrder、helpNumbers、remain、avatars、goods、shareQuery、setShare、reset、enter、hide、buyOriginal、startGroupBuy、reopen、buy。
 * @example
 * import { useOrderingPingtuan } from '@/pages/ordering/menu/composables/use-pingtuan'
 * declare const options: Parameters<typeof useOrderingPingtuan>[0]
 * useOrderingPingtuan(options) // => 对象，包含 visible、setting、openId、numberOrder、helpNumbers、remain、avatars、goods、shareQuery、setShare、reset、enter、hide、buyOriginal、startGroupBuy、reopen、buy
 */
export function useOrderingPingtuan(options: PingtuanOptions) {
  const availability = useShopCheckoutAvailability()
  let checkingCheckout = false
  const { t } = useI18n()

  const { sku } = options

  const visible = ref(false)

  const setting = ref<PingtuanSet | null>(null)
  /** 当前团 id（原 pingtuan_open_id） */

  const openId = ref<number | string | null>(null)

  const helpNumbers = ref(0)

  const avatars = ref<string[]>([])

  /** 分享进入的商品与团（原 share_goods_id / share_pingtuan_open_id） */

  let shareGoodsId: string | null = null

  let shareOpenId: string | null = null

  const numberOrder = computed(() => setting.value?.numberOrder || 0)
  /** 还差人数 > 0 时显示“一起拼”，否则“重新开团” */

  const remain = computed(() => Math.max(0, numberOrder.value - helpNumbers.value))

  const goods = computed(() => sku.detail.value?.basicInfo || null)

  /** 分享参数（有团 id 时携带） */

  const shareQuery = computed<Record<string, string | number | undefined>>(() => {
    const id = goods.value?.id

    return openId.value && id ? { share_goods_id: id, share_pingtuan_open_id: openId.value } : {}
  })

  function setShare(goodsId?: string, pingtuanOpenId?: string) {
    shareGoodsId = goodsId || null

    shareOpenId = pingtuanOpenId || null
  }

  /** 每次打开商品前重置团信息 */

  function reset() {
    openId.value = null

    visible.value = false
  }

  /** 拼团商品：读取拼团设置、开团（或使用分享的团）、读取参团头像后弹出拼团层 */

  async function enter(detail: GoodsDetail): Promise<PingtuanEnterResult> {
    const goodsId = detail.basicInfo.id

    let set: PingtuanSet

    try {
      set = await pingtuanApi.set(goodsId)
    }
    catch {
      toast(t('index.pingtuanNoOpen'))

      return 'detail'
    }

    let tuanId: number | string

    if (shareGoodsId && String(shareGoodsId) === String(goodsId) && shareOpenId) {
      // 别人分享的团

      tuanId = shareOpenId
    }
    else {
      try {
        tuanId = (await pingtuanApi.open(goodsId)).id
      }
      catch (e) {
        if (needsLogin(e)) {
          options.onNeedLogin()
        }
        else {
          showError(e)
        }

        return 'abort'
      }
    }

    const joiners = await pingtuanApi.joinUsers(tuanId).catch(() => undefined)

    if (joiners === null && shareOpenId) {
      // 分享的团已不存在：忽略分享团，重新开团

      shareOpenId = null

      return enter(detail)
    }

    setting.value = set

    openId.value = tuanId

    helpNumbers.value = joiners?.length || 0

    avatars.value = pingtuanAvatars(set, joiners || [])

    visible.value = true

    return 'pingtuan'
  }

  function hide() {
    visible.value = false
  }

  /** 原价购买：切换到规格弹层 */

  function buyOriginal() {
    visible.value = false

    sku.setPingtuanMode(false)

    sku.open()
  }

  /** 一起拼：以拼团价进入规格弹层（原 _lijipingtuanbuy） */

  function startGroupBuy() {
    visible.value = false

    sku.setPingtuanMode(true)

    sku.open()
  }

  /** 已拼成：重新开团（原 _lijipingtuanbuy2） */

  function reopen() {
    shareOpenId = null

    if (goods.value) {
      options.onReopen(goods.value.id)
    }
  }

  /** 规格弹层中的“一起拼”：写入拼团商品并去结算（原 pingtuanbuy） */

  async function buy() {
    if (checkingCheckout)
      return
    const d = sku.detail.value

    const quote = sku.quote.value

    if (!d || !quote || !sku.validate()) {
      return
    }

    checkingCheckout = true
    try {
      await availability.ensureAvailable(Number(d.basicInfo.shopId))
      if (sku.detail.value !== d)
        return
    }
    catch (e) {
      showError(e)
      return
    }
    finally {
      checkingCheckout = false
    }

    const b = d.basicInfo

    const sel = sku.selection.value

    const pingtuanGoodsList = [{
      goodsId: b.id,
      number: sku.number.value,
      categoryId: b.categoryId,
      shopId: b.shopId,
      price: quote.price,
      score: b.score,
      pic: b.pic,
      name: b.name,
      minBuyNumber: b.minBuyNumber,
      logisticsId: b.logisticsId,
      sku: buildSkuPayload(d, sel, true),
      additions: buildAdditionPayload(sku.requiredAdditions.value, sel, true),
    }]

    useGoodsDraftStore().buyNowGoods = pingtuanGoodsList.map(item => ({ ...item, key: String(item.goodsId), stores: sku.detail.value?.basicInfo.stores ?? 0, score: Number(item.score) || 0 }))

    go(ClientRoutes.Ordering.pay, { orderType: 'buyNow', pingtuanOpenId: openId.value })
  }

  return {
    visible,
    setting,
    openId,
    numberOrder,
    helpNumbers,
    remain,
    avatars,
    goods,
    shareQuery,
    setShare,
    reset,
    enter,
    hide,
    buyOriginal,
    startGroupBuy,
    reopen,
    buy,
  }
}
