/**
 * ============================================================================
 * 【文件概述】菜单选品 / composables/use-shop-section.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - ShopSectionOptions：数据类型契约。
 * - useOrderingShopSection：本文件对外声明。
 * 【综合使用示例】
 * import type { ShopSectionOptions } from '@/pages/ordering/menu/composables/use-shop-section'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
import { formatDistance, openShopList, parseScanScene, shopApi, toShopDetail, useShopStore } from '@/pages/ordering/index'
import { checkAndAuthorize, hideTabBar, showTabBar } from '../adapters/platform.adapter'
import { platformError } from '../adapters/errors.adapter'
import { relaunch } from '../adapters/navigation.adapter'
import { useOrderingLocale as useI18n } from './use-locale'
import type { PeisongType, ScanDining, Shop } from '@/pages/ordering/index'
import { computed } from 'vue'
import { confirm } from '@/utils/project/interaction'
import { navigate as go } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'
/**
 * 点餐页 - 门店区 ViewModel
 * 来源：bee-master/pages/index/index.js 的 onLoad(scene)/cyTableToken/getshopInfo/fetchShops/
 *       changePeisongType/selectshop/tabbarChange/waimai 以及 onShow 的 refreshIndex 处理
 * 结构字段：onShopReady；必填与可选字段见声明。
 * @example
 * import type { ShopSectionOptions } from '@/pages/ordering/menu/composables/use-shop-section'
 * declare const response: ShopSectionOptions
 * const value: ShopSectionOptions = response // => 保留 ShopSectionOptions 的字段与取值约束
 */

export interface ShopSectionOptions {
  /** 门店确定后（缓存命中 / 定位到最近门店）回调，用于加载分类与商品 */
  onShopReady: (shop: Shop) => void
}

/**
 * 创建 use-shop-section 对应的领域状态与交互能力。
 * @param options {ShopSectionOptions} 调用配置及依赖能力。
 * @returns 对象，包含 shop、peisongType、isOpened、isScanMode、canSwitchPeisong、initScanMode、ensurePeisongType、changePeisongType、loadShop、fetchNearestShop、syncOnShow、selectShop、goShopDetail、goScanCart、goScanOrdered、exitScanMode、restoreTabBar。
 * @example
 * import { useOrderingShopSection } from '@/pages/ordering/menu/composables/use-shop-section'
 * declare const options: Parameters<typeof useOrderingShopSection>[0]
 * useOrderingShopSection(options) // => 对象，包含 shop、peisongType、isOpened、isScanMode、canSwitchPeisong、initScanMode、ensurePeisongType、changePeisongType、loadShop、fetchNearestShop、syncOnShow、selectShop、goShopDetail、goScanCart、goScanOrdered、exitScanMode、restoreTabBar
 */
export function useOrderingShopSection(options: ShopSectionOptions) {
  const { t } = useI18n()

  const shopStore = useShopStore()

  const shop = computed(() => shopStore.current)

  const peisongType = computed(() => shopStore.peisongType)

  const isOpened = computed(() => shopStore.isOpened)

  const isScanMode = computed(() => shopStore.isScanMode)
  const tableCode = computed(() => shopStore.scanDining?.tableCode)
  /** 门店同时开启外卖和自取时才显示切换 */

  const canSwitchPeisong = computed(() => !!(shop.value?.openWaimai && shop.value?.openZiqu))

  function notice(content: string) {
    return confirm({ content, showCancel: false, confirmText: t('common.confirm'), cancelText: t('common.cancel') })
  }

  /** 扫码点餐：用桌台密钥换取临时会话 */

  async function exchangeTableToken(scan: ScanDining) {
    try {
      const response = await shopApi.cyTableToken(scan.id, scan.key)
      const code = response.tableCode
      shopStore.setScanDining({ ...scan, tableCode: typeof code === 'string' || typeof code === 'number' ? String(code) : undefined })
      hideTabBar()
    }
    catch (e) {
      shopStore.setScanDining(null)
      await notice(e instanceof Error ? e.message : '桌台校验失败')
    }
  }

  /**
   * 解析 scene 进入扫码点餐模式
   * - scene 合法：保存桌台并换取会话
   * - scene 存在但不合法：退出扫码模式
   * 返回桌台会话就绪的 Promise（非扫码时立即完成）
   */

  function initScanMode(scene?: string): Promise<void> {
    let ready: Promise<void> = Promise.resolve()

    if (scene) {
      const scan = parseScanScene(scene)

      if (scan) {
        shopStore.setScanDining(scan)

        ready = exchangeTableToken(scan)
      }
      else {
        shopStore.setScanDining(null)
      }
    }

    if (shopStore.scanDining) {
      hideTabBar()
    }

    return ready
  }

  /** 首次进入写入默认配送方式 */

  function ensurePeisongType() {
    if (!shopStore.peisongType)
      shopStore.setPeisongType('zq')
  }

  function changePeisongType(type: PeisongType) {
    shopStore.setPeisongType(type)
  }

  function handleLocationError(e: unknown) {
    const error = platformError(e)

    const errMsg = error.message

    if (error.reason === 'Denied' && error.detail !== 'privacy') {
      checkAndAuthorize('scope.userLocation').catch(() => {
      })

      return
    }

    if (error.detail === 'privacy') {
      notice(t('common.privacyPermission')).then(() => relaunch(ClientRoutes.Ordering.order))

      return
    }

    if (error.reason !== 'Cancelled')
      notice(errMsg)
  }

  /** 按坐标查找最近门店 */

  async function fetchNearestShop(latitude?: number, longitude?: number, kw = '') {
    const list = await shopApi
      .fetchShops({ curlatitude: latitude, curlongitude: longitude, nameLike: kw, pageSize: 1 })
      .catch(() => [] as Shop[])

    if (!list.length) {
      notice(t('common.empty'))

      return
    }

    const nearest: Shop = { ...list[0], distance: formatDistance(list[0].distance) }

    shopStore.setCurrent(nearest)

    options.onShopReady(nearest)
  }

  /** 获取门店：缓存优先，否则定位后取最近门店（原 getshopInfo） */

  async function loadShop() {
    const table = shopStore.scanDining
    if (table) {
      try {
        const detail = toShopDetail(await shopApi.detail(Number(table.shopId)))
        if (shopStore.scanDining !== table)
          return
        shopStore.setCurrent(detail.info)
        options.onShopReady(detail.info)
      }
      catch {
        if (shopStore.scanDining === table) {
          shopStore.setCurrent(null)
          await notice('桌台所属门店加载失败，请重新扫码')
        }
      }
      return
    }
    const cached = shopStore.current
    if (cached) {
      options.onShopReady(cached)
      return
    }
    await fetchNearestShop()
  }

  /** onShow：同步其他页面写入的门店/配送方式；门店选择页标记 refreshIndex 时重新加载 */

  function syncOnShow() {
    void loadShop()
  }

  function selectShop() {
    void openShopList({ mode: 'resume' })
  }

  function goShopDetail() {
    if (shop.value) {
      go(ClientRoutes.Ordering.shopDetail, { id: shop.value.id })
    }
  }

  /** 扫码模式底部栏：购物车 */

  function goScanCart() {
    go(ClientRoutes.Ordering.cart)
  }

  /** 扫码模式底部栏：已点 */

  function goScanOrdered() {
    go(ClientRoutes.Ordering.cartOrder)
  }

  /**
   * 退出扫码点餐，切换到外卖（原 waimai：clearStorageSync + reLaunch）
   * 清除桌台、桌台临时会话与门店缓存后重启点餐页
   */

  function exitScanMode() {
    shopStore.setScanDining(null)

    shopStore.setCurrent(null)

    useShopStore().goodsShopScope = ''

    showTabBar()

    relaunch(ClientRoutes.Ordering.order)
  }

  /** 关闭商品弹层后恢复 tabBar（扫码模式保持隐藏） */

  function restoreTabBar() {
    if (!shopStore.isScanMode) {
      showTabBar()
    }
  }

  return {
    shop,
    peisongType,
    isOpened,
    isScanMode,
    tableCode,
    canSwitchPeisong,
    initScanMode,
    ensurePeisongType,
    changePeisongType,
    loadShop,
    fetchNearestShop,
    syncOnShow,
    selectShop,
    goShopDetail,
    goScanCart,
    goScanOrdered,
    exitScanMode,
    restoreTabBar,
  }
}
