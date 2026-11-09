/**
 * ============================================================================
 * 【文件概述】菜单选品 / composables/use-menu.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - sectionAnchor：本文件对外声明。
 * - useOrderingMenu：本文件对外声明。
 * 【综合使用示例】
 * import { sectionAnchor } from '@/pages/ordering/menu/composables/use-menu'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { useShopStore } from '@/pages/ordering/index'
import { catalogApi } from '../api/catalog.api'
import { categoryShopScope, goodsListAction, MENU_INITIAL_GOODS, miaoshaCountdown } from '../domain/catalog.rules'
import { toGoodsList } from '../models/goods.mappers'
import type { Category, Goods, GoodsListAction, MenuSection, MiaoshaCountdown } from '../models/goods.types'
import type { Shop } from '@/pages/ordering/index'
import { computed, getCurrentScope, nextTick, onScopeDispose, ref } from 'vue'
import { showError } from '@/utils/project/interaction'
/**
 * 点餐页 - 分类 + 连续滚动商品列表 ViewModel
 * 来源：bee-master/pages/index/index.js categories/_getGoodsListContinuous/_loadMoreCategories/
 *       onScroll/_calculateCurrentCategory/categoryClick/_scrollToCategory
 *
 * 与原实现的差异：
 * - 滚动定位改用 scroll-into-view（锚点为分段 id），高亮由组件实测分段位置后回传，不再按固定高度估算
 * - 记录真实的“下一个待加载分类”下标，避免原实现首屏后重复加载同一分类
 * - 点击尚未加载的分类时，先按序加载到该分类再定位
 */

/** 点击分类后屏蔽滚动回传高亮的时长（等待 scroll-into-view 完成） */
const SCROLL_LOCK_MS = 800

/**
 * 生成分类商品分段的滚动锚点。
 * @param categoryId {number | string} 商品分类标识。
 * @returns string，格式为 menu-cat-分类标识。
 * @example
 * import { sectionAnchor } from '@/pages/ordering/menu/composables/use-menu'
 * sectionAnchor(12) // => menu-cat-12
 */
export function sectionAnchor(categoryId: number | string) {
  return `menu-cat-${categoryId}`
}

/**
 * 创建按分类连续加载的菜单状态，串行加载并隔离旧分类响应。 无参数。
 * @returns 对象，包含 categories、sections、countdowns、goodsActions、activeIndex、scrollIntoView、loading、isEmpty、loadCategories、loadMore、selectCategory、onVisibleCategory。
 * @example
 * import { useOrderingMenu } from '@/pages/ordering/menu/composables/use-menu'
 * useOrderingMenu() // => 对象，包含 categories、sections、countdowns、goodsActions、activeIndex、scrollIntoView、loading、isEmpty、loadCategories、loadMore、selectCategory、onVisibleCategory
 */
export function useOrderingMenu() {
  const categories = ref<Category[]>([])

  const sections = ref<MenuSection[]>([])

  const countdowns = ref<Record<number, MiaoshaCountdown>>({})
  /** 左侧高亮的分类下标（categories 下标） */

  const activeIndex = ref(0)

  const scrollIntoView = ref('')

  const loading = ref(false)
  const failed = ref(false)
  const emptyCategoryIds = ref<number[]>([])
  const navigationCategories = computed(() => categories.value.filter(item => !emptyCategoryIds.value.includes(item.id)))
  const navigationActive = computed(() => navigationCategories.value.findIndex(item => item.id === categories.value[activeIndex.value]?.id))

  /** 下一个待加载的分类下标 */

  let nextIndex = 0
  /** 每次重新加载分类自增，用于丢弃过期的异步结果 */

  let generation = 0
  if (getCurrentScope())
    onScopeDispose(() => { generation++ })
  /** 串行执行加载任务，避免并发加载导致分段重复/乱序 */

  let chain: Promise<void> = Promise.resolve()

  let pending = 0

  let lockUntil = 0

  const isEmpty = computed(() => !loading.value && !failed.value && sections.value.length === 0)

  /** 商品 id → 列表按钮状态 */

  const goodsActions = computed(() => {
    const map: Record<number, GoodsListAction> = {}

    sections.value.forEach(s => s.goods.forEach((g) => {
      map[g.id] = goodsListAction(g, countdowns.value[g.id] || null)
    }))

    return map
  })

  function totalGoods() {
    return sections.value.reduce((n, s) => n + s.goods.length, 0)
  }

  function enqueue(task: () => Promise<void>) {
    pending++

    chain = chain.then(task, task).finally(() => {
      pending--
    })

    return chain
  }

  async function fetchCategoryGoods(category: Category): Promise<Goods[]> {
    const res = await catalogApi.goodsList({ shopId: useShopStore().goodsShopScope || undefined, page: 1, categoryId: category.id, pageSize: 10000 }).then(toGoodsList)

    return res.result || []
  }

  /**
   * 从 nextIndex 起按序加载分类商品，直到 stop 返回 true 或分类加载完
   * stop(index, count)：index 为刚加载的分类下标，count 为该分类商品数
   */

  async function loadSequential(gen: number, stop: (index: number, count: number) => boolean) {
    if (gen !== generation || nextIndex >= categories.value.length) {
      return
    }

    while (nextIndex < categories.value.length) {
      const index = nextIndex++

      const category = categories.value[index]

      let goods: Goods[]
      try {
        goods = await fetchCategoryGoods(category)
      }
      catch {
        if (gen === generation) {
          failed.value = true
          nextIndex = index
        }
        return
      }

      if (gen !== generation) {
        return
      }

      if (goods.length) {
        const now = Date.now()

        const cd = { ...countdowns.value }

        goods.forEach((g) => {
          const c = miaoshaCountdown(g, now)

          if (c) {
            cd[g.id] = c
          }
        })

        countdowns.value = cd

        sections.value = [...sections.value, { category, categoryIndex: index, goods }]
      }
      else {
        emptyCategoryIds.value = [...emptyCategoryIds.value, category.id]
      }

      if (stop(index, goods.length)) {
        break
      }
    }
  }

  function reset() {
    generation++

    nextIndex = 0

    categories.value = []
    emptyCategoryIds.value = []
    failed.value = false

    sections.value = []

    countdowns.value = {}

    activeIndex.value = 0

    scrollIntoView.value = ''
  }

  /**
   * 加载分类并首屏连续加载商品（原 categories + _getGoodsListContinuous）
   * goodsSplit：系统参数 shop_goods_split，'1' 表示门店商品隔离
   */

  async function loadCategories(shop: Shop | null, goodsSplit: string) {
    reset()

    const gen = generation

    loading.value = true

    try {
      let list: Category[]

      try {
        list = await catalogApi.categories(categoryShopScope(shop?.id, goodsSplit))
      }
      catch (e) {
        if (gen === generation) {
          failed.value = true
          showError(e)
        }

        return
      }

      if (gen !== generation) {
        return
      }
      // 商品列表接口从 storage.shopIds 读取门店过滤条件

      if (goodsSplit === '1' && shop) {
        useShopStore().goodsShopScope = String(shop.id)
      }
      else {
        useShopStore().goodsShopScope = ''
      }

      categories.value = list

      await enqueue(() => loadSequential(gen, () => totalGoods() >= MENU_INITIAL_GOODS))
      if (gen === generation && emptyCategoryIds.value.includes(categories.value[activeIndex.value]?.id))
        activeIndex.value = sections.value[0]?.categoryIndex ?? 0
    }
    finally {
      if (gen === generation) {
        loading.value = false
      }
    }
  }

  /** 触底：继续加载下一个有商品的分类（原 _loadMoreCategories） */

  function loadMore() {
    if (failed.value || pending > 0 || nextIndex >= categories.value.length) {
      return Promise.resolve()
    }

    const gen = generation

    return enqueue(() => loadSequential(gen, (_i, count) => count > 0))
  }

  function scrollToSection(section: MenuSection) {
    scrollIntoView.value = ''
    const gen = generation

    nextTick(() => {
      if (gen !== generation)
        return
      lockUntil = Date.now() + SCROLL_LOCK_MS

      scrollIntoView.value = sectionAnchor(section.category.id)
    })
  }

  /** 点击左侧分类：必要时先加载到该分类，再滚动定位 */

  async function selectCategory(index: number) {
    if (!Number.isInteger(index) || index < 0 || index >= categories.value.length)
      return
    activeIndex.value = index

    lockUntil = Date.now() + SCROLL_LOCK_MS

    const gen = generation

    if (index >= nextIndex) {
      await enqueue(() => loadSequential(gen, i => i >= index))
    }

    if (gen !== generation || activeIndex.value !== index) {
      return
    }
    // 该分类无商品时定位到其后第一个有商品的分段

    const target = sections.value.find(s => s.categoryIndex >= index)

    if (target) {
      scrollToSection(target)
    }
  }

  /** 列表滚动时组件回传当前可见分段对应的分类下标 */

  function onVisibleCategory(categoryIndex: number) {
    if (Date.now() < lockUntil) {
      return
    }

    if (categoryIndex !== activeIndex.value) {
      activeIndex.value = categoryIndex
    }
  }

  function selectNavigationCategory(index: number) {
    const category = navigationCategories.value[index]
    if (category)
      return selectCategory(categories.value.findIndex(item => item.id === category.id))
  }

  return {
    categories,
    navigationCategories,
    navigationActive,
    selectNavigationCategory,
    failed,
    sections,
    countdowns,
    goodsActions,
    activeIndex,
    scrollIntoView,
    loading,
    isEmpty,
    loadCategories,
    loadMore,
    selectCategory,
    onVisibleCategory,
  }
}
