import type { CartItem } from '@/pages/ordering/menu-cart'
import { describeCartItem } from '@/pages/ordering/menu-cart'
/**
 * ============================================================================
 * 【文件概述】菜单选品 / composables/use-page.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - useOrderingPage：本文件对外声明。
 * 【综合使用示例】
 * import { useOrderingPage } from '@/pages/ordering/menu/composables/use-page'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { IndexPageQuery, OrderingNotice as Notice } from '../models/types'
import type { Goods } from '../models/goods.types'
import type { Banner } from '@/pages/home/index'
import { ref } from 'vue'
import { buildUrl, openLink } from '../adapters/navigation.adapter'
import { hideTabBar } from '../adapters/platform.adapter'
import { useOrderingCartBar } from './use-cart-bar'
import { useOrderingCartBarBinding } from './use-cart-bar-binding'
import { useOrderingMenu } from './use-menu'
import { useOrderingPingtuan } from './use-pingtuan'
import { useOrderingShopSection } from './use-shop-section'
import { useOrderingSkuPopup } from './use-sku-popup'
import { getIdentity, getToken, requireIdentity, useSessionState } from '@/pages/auth/session'
import { bannerApi } from '@/pages/home/index'
import { orderingContentApi } from '../api/content.api'
import { normalizeNotices } from '../models/notices'
import { orderingSettings } from '@/pages/ordering/index'
import { setTitle } from '@/utils/project/interaction'
import { navigate as go } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'
/**
 * 点餐页 ViewModel 装配：组合门店/菜单/购物车/规格/拼团，并处理公告、Banner、
 * 标题、静默登录、分享与生命周期编排
 * 来源：bee-master/pages/index/index.js onLoad/onShow/onShareAppMessage/
 *       noticeLastOne/goNotice/banners/tapBanner/hideGoodsDetailPOP/showGoodsDetailPOP
 * @returns 对象，包含 shop、menu、cart、sku、pingtuan、notices、banners、init、onShow、openGoods、goGoodsDetail、closeGoodsPopups、goNotice、tapBanner、shareMessage。
 * @example
 * import { useOrderingPage } from '@/pages/ordering/menu/composables/use-page'
 * useOrderingPage() // => 对象，包含 shop、menu、cart、sku、pingtuan、notices、banners、init、onShow、openGoods、goGoodsDetail、closeGoodsPopups、goNotice、tapBanner、shareMessage
 */

export function useOrderingPage() {
  const notices = ref<Notice[]>([])

  const banners = ref<Banner[]>([])
  // 平台广告独立于门店上下文，选店与菜单刷新不重新请求或清空广告。
  const adBanners = ref<Banner[]>([])

  /** 扫码点餐桌台会话就绪（避免会话未就绪时请求购物车触发 2000 清会话） */

  let tableSessionReady: Promise<void> = Promise.resolve()

  function sysValue(key: 'mallName' | 'share_profile' | 'shop_goods_split') {
    return orderingSettings[key] ?? ''
  }

  const menu = useOrderingMenu()

  const shop = useOrderingShopSection({
    onShopReady: s => menu.loadCategories(s, sysValue('shop_goods_split')),
  })

  const cart = useOrderingCartBar({
    isScanMode: () => shop.isScanMode.value,
    onNeedLogin: relogin,
  })

  const sku = useOrderingSkuPopup({
    addToCart: cmd => cart.addItem(cmd),
    updateCart: (item, cmd) => cart.updateItem(item, cmd),
    onClose: closeGoodsPopups,
  })

  const cartBar = useOrderingCartBarBinding(cart, shop)

  const pingtuan = useOrderingPingtuan({
    sku,
    onNeedLogin: relogin,
    onReopen: openGoods,
  })

  /* ---------------- 登录 ---------------- */

  /** 普通模式静默注册/登录并绑定邀请人 */

  async function silentLogin() {
    // 浏览不静默创建会话；有有效顾客身份时才同步购物车。
    if (getIdentity() === 'customer' && getToken())
      await cart.refresh()
  }

  /** 接口返回未登录：重新登录后刷新页面数据（原 AUTH.login(this) → onShow） */

  async function relogin() {
    const ok = requireIdentity('customer')

    if (ok) {
      onShow()
    }
  }

  /* ---------------- 商品弹层 ---------------- */

  /** 关闭规格/拼团弹层并恢复 tabBar（原 hideGoodsDetailPOP） */

  function closeGoodsPopups() {
    sku.hide()

    pingtuan.hide()

    shop.restoreTabBar()
  }

  /** 打开商品：拼团商品先弹拼团层，否则弹规格层（原 showGoodsDetailPOP/_showGoodsDetailPOP） */

  async function openGoods(goodsId: number | string, original?: CartItem) {
    if (sku.submitting.value || cart.mutating.value)
      return
    const matches = cart.items.value.filter(item => item.goodsId === Number(goodsId))
    if (!original && matches.length === 1)
      original = matches[0]
    if (!original && matches.length > 1) {
      try {
        const result = await uni.showActionSheet({ itemList: matches.map(item => `${describeCartItem(item) || item.name} ×${item.number}`) })
        original = matches[result.tapIndex]
      }
      catch {
        return
      }
    }
    pingtuan.reset()

    sku.hide()

    const detail = await sku.load(goodsId, original)

    if (!detail) {
      return
    }

    hideTabBar()

    if (original || !detail.basicInfo.pingtuan) {
      sku.open()

      return
    }

    const result = await pingtuan.enter(detail)

    if (result === 'detail') {
      sku.open()
    }
    else if (result === 'abort') {
      shop.restoreTabBar()
    }
  }

  function goGoodsDetail(goods: Goods) {
    go(ClientRoutes.Ordering.goodsDetails, { id: goods.id })
  }

  /* ---------------- 公告 / Banner ---------------- */

  async function loadNotice() {
    notices.value = await orderingContentApi.notices().then(normalizeNotices).catch(() => [])
  }

  function goNotice(item: Notice) {
    go(ClientRoutes.Ordering.noticeDetail, { id: item.id })
  }

  async function loadBanners() {
    banners.value = await bannerApi.banners('diancang').catch(() => [])
  }

  async function loadAdBanners() {
    adBanners.value = await bannerApi.banners('ordering_ad').catch(() => [])
  }

  function tapBanner(banner: Banner) {
    if (banner.linkUrl)
      openLink(banner.linkUrl)
  }

  /* ---------------- 标题 / 分享 ---------------- */

  function applyTitle() {
    setTitle(sysValue('mallName'))
  }

  function shareMessage() {
    return { title: `${sysValue('mallName')} ${sysValue('share_profile')}`, path: buildUrl(ClientRoutes.Ordering.order, { inviter_id: useSessionState().userInfo.userId, ...pingtuan.shareQuery.value }) }
  }

  /* ---------------- 生命周期 ---------------- */

  function init(query: IndexPageQuery = {}) {
    tableSessionReady = shop.initScanMode(query.scene)
    if (query.share_goods_id) {
      pingtuan.setShare(query.share_goods_id, query.share_pingtuan_open_id)

      openGoods(query.share_goods_id)
    }

    if (!shop.isScanMode.value) {
      // 登录完成后再刷新一次购物车（首次进入时 onShow 可能早于登录）

      void silentLogin()
    }

    applyTitle()

    shop.ensurePeisongType()

    loadNotice()

    shop.loadShop()

    loadBanners()
    loadAdBanners()
  }

  async function onShow() {
    shop.syncOnShow()

    await tableSessionReady

    cart.refresh()
  }

  return {
    shop,
    menu,
    cart,
    cartBar,
    sku,
    pingtuan,
    notices,
    banners,
    adBanners,
    init,
    onShow,
    openGoods,
    goGoodsDetail,
    closeGoodsPopups,
    goNotice,
    tapBanner,
    shareMessage,
  }
}
