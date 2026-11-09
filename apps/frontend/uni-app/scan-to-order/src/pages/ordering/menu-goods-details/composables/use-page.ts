/**
 * ============================================================================
 * 【文件概述】商品详情 / composables/use-page.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - useGoodsDetailPage：本文件对外声明。
 * 【综合使用示例】
 * import { useGoodsDetailPage } from '@/pages/ordering/menu-goods-details/composables/use-page'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { orderingSettings, shopApi, toShopDetail } from '@/pages/ordering/index'
import { buildUrl, catalogApi, toGoodsDetail, useOrderingLocale as useI18n } from '@/pages/ordering/menu'
import { goodsMediaApi } from '../api/media.api'
import { useGoodsDraftStore } from '@/pages/ordering/menu-pay'
import type { GoodsDetailPageModel, GoodsDetailQuery } from '../models/types'
/**
 * 商品详情页 ViewModel（装配：详情 / SKU / 砍价 / 海报）
 * 来源：bee-master/pages/goods-details/index.js
 *   onLoad、onShow、getGoodsDetailAndKanjieInfo、shopSubdetail、getVideoSrc、
 *   shippingCartInfo、onShareAppMessage、previewImage
 */
import type { GoodsDetail } from '@/pages/ordering/menu'
import type { ShopDetail } from '@/pages/ordering/index'
import { useCartStore } from '@/pages/ordering/menu-cart'
import { getIdentity, getToken, useSessionState } from '@/pages/auth/session'
import { previewImage as previewImages, setTitle } from '@/utils/project/interaction'

import { ClientRoutes } from '@/pages/routes'
import { useGoodsDetailKanjia } from './use-kanjia'
import { useGoodsDetailPoster } from './use-poster'
import { useGoodsDetailSkuSelector } from './use-sku-selector'

/**
 * 组合商品详情、规格、砍价、海报及购物车数量展示。 无参数。
 * @returns 对象，包含 session、goodsId、detail、basicInfo、shopSubdetail、videoMp4Src、skuShowType、commission、outOfStock、shopNum、sku、kanjia、poster、init、onPageShow、loadDetail、onBuyTap、previewImage、shareMessage。
 * @example
 * import { useGoodsDetailPage } from '@/pages/ordering/menu-goods-details/composables/use-page'
 * useGoodsDetailPage() // => 对象，包含 session、goodsId、detail、basicInfo、shopSubdetail、videoMp4Src、skuShowType、commission、outOfStock、shopNum、sku、kanjia、poster、init、onPageShow、loadDetail、onBuyTap、previewImage、shareMessage
 */
export function useGoodsDetailPage() {
  const { t } = useI18n()

  const session = useSessionState()

  const cartStore = useCartStore()

  const goodsId = ref<GoodsDetailPageModel['goodsId']>('')

  const detail = ref<GoodsDetail | null>(null)

  const shopSubdetail = ref<ShopDetail | null>(null)

  const videoMp4Src = ref('')
  /** 0：规格弹窗选择；1：页面内展开选择（原 goodsDetailSkuShowType） */

  const skuShowType = ref(0)

  const kanjia = useGoodsDetailKanjia({ reload: () => loadDetail() })

  const sku = useGoodsDetailSkuSelector({
    detail,
    isKanjiaOwner: kanjia.isOwner,
    kanjiaId: () => kanjia.curGoodsKanjia.value?.id,
    reload: () => loadDetail(),
  })

  const poster = useGoodsDetailPoster(detail)

  const basicInfo = computed(() => detail.value?.basicInfo)
  /** 分销佣金提示：commissionType 1 积分 / 2 现金 */

  const commission = computed(() => {
    const b = basicInfo.value

    return { type: Number(b?.commissionType || 0), value: b?.commission as number | string | undefined }
  })
  /** 库存不足起购数量：补货中 */

  const outOfStock = computed(() => {
    const b = basicInfo.value

    return !!b && b.stores < b.minBuyNumber
  })

  const shopNum = computed(() => cartStore.totalNumber)

  /** 原 onLoad：解析邀请人 / 小程序码 scene / 砍价发起人 */

  function init(query: GoodsDetailQuery = {}) {
    setTitle(t('goodsDetail.title'))

    let id = query.id || ''

    if (query.inviter_id) {
      useGoodsDraftStore().referrer = query.inviter_id
    }

    if (query.scene) {
      // 小程序码 scene：商品id,邀请人uid

      const parts = decodeURIComponent(query.scene).split(',')

      if (parts.length >= 2) {
        id = parts[0]

        useGoodsDraftStore().referrer = parts[1]
      }
    }

    goodsId.value = id

    kanjia.setJoinUid(query.kjJoinUid)

    skuShowType.value = Number(orderingSettings.goodsDetailSkuShowType) || 0

    loadDetail()

    shippingCartInfo()

    sku.loadAdditions(id)
  }

  /** 原 onShow：静默登录并绑定邀请人 */

  async function onPageShow() {
    if (getIdentity() === 'customer' && getToken())
      await cartStore.refresh()
  }

  /** 商品详情 + 砍价信息（原 getGoodsDetailAndKanjieInfo） */

  async function loadDetail() {
    if (!goodsId.value) {
      return
    }

    const d = await catalogApi.goodsDetail(goodsId.value).then(toGoodsDetail).catch(() => null)

    if (!d) {
      return
    }

    if (!d.pics || !d.pics.length) {
      d.pics = [{ pic: d.basicInfo.pic }]
    }

    if (d.basicInfo.shopId) {
      loadShop(d.basicInfo.shopId)
    }

    if (d.basicInfo.videoId) {
      loadVideo(d.basicInfo.videoId)
    }

    detail.value = d

    sku.applyDetail(d)

    await kanjia.load(d.basicInfo.id)

    await sku.loadSchedule()
  }

  /** 商品所属门店（原 shopSubdetail） */

  async function loadShop(shopId: number) {
    shopSubdetail.value = await shopApi.detail(shopId).then(toShopDetail).catch(() => null)
  }

  /** 主图视频（原 getVideoSrc） */

  async function loadVideo(videoId: string) {
    const v = await goodsMediaApi.videoDetail(videoId).catch(() => null)

    videoMp4Src.value = v?.fdMp4 || ''
  }

  /** 购物车数量（原 shippingCartInfo / TOOLS.showTabBarBadge(true)） */

  function shippingCartInfo() {
    if (session.hasLogin) {
      cartStore.refresh()
    }
  }

  /** 底部主按钮 / 砍价购买：弹窗模式先打开规格，展开模式直接提交 */

  function onBuyTap() {
    if (skuShowType.value === 0) {
      sku.openPopup()
    }
    else {
      sku.addShopCar()
    }
  }

  function previewImage(url: string) {
    previewImages([url], url)
  }

  /** 原 onShareAppMessage：带邀请人，砍价时带发起人 */

  function shareMessage() {
    const b = basicInfo.value

    const share = {
      title: b?.name || '',
      path: buildUrl(ClientRoutes.Ordering.goodsDetails, { id: b?.id, inviter_id: String(session.userInfo.userId) }),
    }

    if (kanjia.kjJoinUid.value) {
      const nick = kanjia.curKanjiaprogress.value?.joiner?.nick || ''

      share.title = `${nick} ${t('goodsDetail.inviteKanJia')}`

      share.path = buildUrl(share.path, { kjJoinUid: kanjia.kjJoinUid.value })
    }

    return share
  }

  return {
    session,
    goodsId,
    detail,
    basicInfo,
    shopSubdetail,
    videoMp4Src,
    skuShowType,
    commission,
    outOfStock,
    shopNum,
    sku,
    kanjia,
    poster,
    init,
    onPageShow,
    loadDetail,
    onBuyTap,
    previewImage,
    shareMessage,
  }
}
