/**
 * ============================================================================
 * 【文件概述】商品搜索 / composables/use-page.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - useGoodsSearchPage：本文件对外声明。
 * 【综合使用示例】
 * import { useGoodsSearchPage } from '@/pages/ordering/menu-search/composables/use-page'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { orderingSettings, useShopStore } from '@/pages/ordering/index/index'
import { buildSkuPayload, catalogApi, errorCode, isApiError, needsLogin, showTabBar, toGoodsDetail, toGoodsList, useOrderingLocale as useI18n, useOrderingSkuSelection } from '@/pages/ordering/menu'
import type { Goods, GoodsDetail, GoodsListQuery, GoodsOrderBy, PropertyChild } from '@/pages/ordering/menu'
import type { AddCartCommand } from '@/pages/ordering/menu-cart'
import { useCartStore } from '@/pages/ordering/menu-cart'
import { requireIdentity } from '@/pages/auth/session'
import { usePagedList } from '@/hooks/project/usePagedList'
import { setTitle, showError, toast } from '@/utils/project/interaction'
import { navigate as go } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'
import { computed, getCurrentScope, onScopeDispose, ref, watch } from 'vue'
/**
 * 商品列表 / 搜索 ViewModel
 * 来源：bee-master/pages/goods/list.js
 *   onLoad、readConfigVal、search、onReachBottom、changeShowType、bindinput、bindconfirm、filter、
 *   addShopCar、addShopCarCheck、addShopCarDone、storesJia、storesJian、closeSku、skuSelect、addCarSku
 */

/** apifm：加购时商品需要选择规格 */
const CODE_NEED_SKU = 30002

/** 排序：'' 综合 / addedDown 新品 / ordersDown 销量 / priceUp 价格 */

function safeDecode(v?: string) {
  if (typeof v !== 'string' || !v) {
    return ''
  }

  try {
    return decodeURIComponent(v)
  }
  catch {
    return v
  }
}

/**
 * 创建商品搜索、分页、排序和快速选规格流程，状态属于当前页面实例。 无参数。
 * @returns 对象，包含 listType、name、orderBy、showSellerNumber、goods、isEmpty、loading、failed、skuGoods、skuBuyNumber、init、search、loadMore、changeShowType、confirmSearch、filter、openGoods、addShopCar、storesJia、storesJian、closeSku、skuSelect、isSkuActive、addCarSku。
 * @example
 * import { useGoodsSearchPage } from '@/pages/ordering/menu-search/composables/use-page'
 * useGoodsSearchPage() // => 对象，包含 listType、name、orderBy、showSellerNumber、goods、isEmpty、loading、failed、skuGoods、skuBuyNumber、init、search、loadMore、changeShowType、confirmSearch、filter、openGoods、addShopCar、storesJia、storesJian、closeSku、skuSelect、isSkuActive、addCarSku
 */
export function useGoodsSearchPage() {
  const { t } = useI18n()

  const cartStore = useCartStore()

  /** 1：一行一个（列表）；2：一行两个（宫格） */

  const listType = ref<1 | 2>(2)

  const name = ref('')

  const orderBy = ref<GoodsOrderBy>('')

  const categoryId = ref('')

  const showSellerNumber = ref('')

  /** 需要选规格的快速加购商品（原 skuCurGoods） */

  const skuGoods = ref<GoodsDetail | null>(null)

  const sku = useOrderingSkuSelection({ detail: skuGoods })
  /** 原 skuCurGoods.basicInfo.storesBuy */

  const skuBuyNumber = ref(1)

  const submitting = ref(false)
  let skuVersion = 0
  let disposed = false
  watch(() => useShopStore().goodsShopScope, () => {
    skuVersion++
    skuGoods.value = null
  }, { flush: 'sync' })
  if (getCurrentScope()) {
    onScopeDispose(() => {
      disposed = true
      skuVersion++
    })
  }

  const paged = usePagedList<Goods>(async (page, pageSize) => {
    const res = await catalogApi.goodsList({ shopId: useShopStore().goodsShopScope || undefined, orderBy: orderBy.value, page, pageSize, k: name.value || undefined, categoryId: categoryId.value || undefined }).then(toGoodsList)

    return { list: res.result || [], totalPage: res.totalPage }
  }, { scopeKey: () => [useShopStore().goodsShopScope, name.value, categoryId.value, orderBy.value].join('|'), beforeLoad: () => true })

  const goods = paged.list

  const isEmpty = computed(() => paged.loaded.value && !paged.failed.value && goods.value.length === 0)

  function init(query: GoodsListQuery = {}) {
    setTitle(t('goodsList.t'))

    name.value = safeDecode(query.name)

    categoryId.value = query.categoryId || ''

    search()

    readConfigVal()
    // 系统参数加载完成后再读一次（原 configLoadOK 补偿写法）
  }

  /** 原 readConfigVal */

  function readConfigVal() {
    showSellerNumber.value = orderingSettings.showSellerNumber

    const showType = orderingSettings.goodsSearchShowType

    listType.value = showType === '1' ? 1 : 2
  }

  /** 从第一页重新搜索 */

  function search() {
    return paged.refresh()
  }

  /** 触底加载下一页（原 onReachBottom） */

  function loadMore() {
    return paged.loadMore()
  }

  function changeShowType() {
    listType.value = listType.value === 1 ? 2 : 1
  }

  /** 输入框确认（原 bindconfirm） */

  function confirmSearch(value?: string) {
    if (value !== undefined) {
      name.value = value
    }

    search()
  }

  /** 排序筛选（原 filter） */

  function filter(val: GoodsOrderBy) {
    orderBy.value = val

    search()
  }

  function openGoods(item: Goods) {
    go(ClientRoutes.Ordering.goodsDetails, { id: item.id })
  }

  /** 列表上的购物车按钮（原 addShopCar） */

  async function addShopCar(item: Goods) {
    if (item.stores <= 0) {
      toast(t('goodsDetail.noStores'))

      return
    }

    await addShopCarCheck({ goodsId: item.id, number: 1, sku: [] })
  }

  /** 登录校验后加购（原 addShopCarCheck） */

  async function addShopCarCheck(cmd: AddCartCommand) {
    if (requireIdentity('customer')) {
      await addShopCarDone(cmd)
    }
  }

  /** 加购；需要规格(30002)时拉取详情并弹出规格选择（原 addShopCarDone） */

  async function addShopCarDone(cmd: AddCartCommand) {
    if (submitting.value) {
      return
    }

    submitting.value = true

    try {
      await cartStore.add(cmd)

      toast(t('goodsDetail.addCartSuccess'), 'success')

      skuGoods.value = null
    }
    catch (e) {
      if (isApiError(e) && errorCode(e) === CODE_NEED_SKU) {
        await openSku(cmd.goodsId)
      }
      else if (needsLogin(e)) {
        if (requireIdentity('customer')) {
          await search()
        }
      }
      else {
        showError(e)
      }
    }
    finally {
      submitting.value = false
    }
  }

  async function openSku(goodsId: number) {
    const version = ++skuVersion
    try {
      const detail = await catalogApi.goodsDetail(goodsId).then(toGoodsDetail)
      if (disposed || version !== skuVersion)
        return
      skuGoods.value = detail

      sku.reset()

      skuBuyNumber.value = 1
    }
    catch (e) {
      if (!disposed && version === skuVersion)
        showError(e)
    }
  }

  function storesJia() {
    const g = skuGoods.value

    if (g && skuBuyNumber.value < g.basicInfo.stores) {
      skuBuyNumber.value++
    }
  }

  function storesJian() {
    if (skuBuyNumber.value > 1) {
      skuBuyNumber.value--
    }
  }

  function closeSku() {
    skuVersion++
    skuGoods.value = null

    showTabBar()
  }

  /** 选择规格（原 skuSelect） */

  function skuSelect(propertyId: number, child: PropertyChild) {
    sku.chooseProperty(propertyId, child.id)
  }

  const isSkuActive = sku.isPropActive

  /** 规格选择后加购（原 addCarSku） */

  async function addCarSku() {
    const g = skuGoods.value

    if (!g) {
      return
    }

    const skuPayload = buildSkuPayload(g, sku.selection.value)

    if (skuPayload.length !== (g.properties || []).length) {
      toast(t('goodsDetail.noSelectSku'))

      return
    }

    await addShopCarDone({ goodsId: g.basicInfo.id, number: skuBuyNumber.value, sku: skuPayload })
  }

  return {
    listType,
    name,
    orderBy,
    showSellerNumber,
    goods,
    isEmpty,
    loading: paged.loading,
    failed: paged.failed,
    skuGoods,
    skuBuyNumber,
    init,
    search,
    loadMore,
    changeShowType,
    confirmSearch,
    filter,
    openGoods,
    addShopCar,
    storesJia,
    storesJian,
    closeSku,
    skuSelect,
    isSkuActive,
    addCarSku,
  }
}
