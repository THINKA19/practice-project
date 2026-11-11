/**
 * ============================================================================
 * 【文件概述】
 * 礼品卡记录领域业务编排层；通过礼品卡和会话公开入口访问数据，隔离账号切换后的迟到响应。
 *
 * 【方法与导出清单】
 * useCardLogsPage()：创建本页独立状态与业务操作。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useCardLogsPage } from '@/pages/home/service/gift-card-logs'
 * // 在 Vue setup 中调用，作用域销毁时释放会话监听。
 * const page = useCardLogsPage()
 * await page.init({ cardId: '7' }) // => 当前账号持卡时加载第一页
 * await page.loadMore() // => 未到底且空闲时加载后续记录
 * ```
 * ============================================================================
 */
import type { MyCard } from '../../gift-card'
import type { CardLog } from '../models/types'
import { cardLogsApi } from '../api/logs.api'
import { parseCardLogsPage } from '../models/mappers'
import { computed, ref } from 'vue'
import { cardApi } from '../../gift-card'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'
import { showError } from '@/utils/project/interaction'

/**
 * 装配礼品卡使用记录的响应式状态与操作。
 * 无参数；须在 Vue setup 或响应式作用域内调用。
 * @returns 独立的响应式状态和操作方法；请求失败由页面状态或交互提示表达。
 * @example const page = useCardLogsPage() // => 初始状态独立，尚未发起请求
 */
export function useCardLogsPage() {
  const list = ref<CardLog[]>([])
  const card = ref<MyCard>()
  const invalidCard = ref(false)

  const loaded = ref(false)

  const failed = ref(false)

  const loading = ref(false)

  let cardId = ''

  let page = 0

  const finished = ref(false)
  const hasMore = computed(() => list.value.length > 0 && !finished.value)
  let retryReset = true

  let generation = 0
  const demoBusy = ref(false)

  const scope = useSessionAccountScope(() => {
    generation++
    demoBusy.value = false

    list.value = []
    card.value = undefined
    failed.value = false

    loaded.value = false

    loading.value = false

    page = 0

    finished.value = false
  })

  /**
   * 加载当前持卡人的记录，按请求代次忽略旧响应。
   * @param reset boolean；true 重置第一页，false 请求下一页。
   * @returns Promise<void>；失败保存重试模式，不推进页码。
   * @example
   * await load(true) // => 验证持卡后加载第一页
   */
  async function load(reset: boolean) {
    if (invalidCard.value || !cardId || (!reset && (loading.value || finished.value)) || !requireIdentity('customer'))
      return

    const ticket = scope.ticket()

    const request = ++generation

    const next = reset ? 1 : page + 1

    loading.value = true

    failed.value = false

    try {
      if (reset) {
        list.value = []
        card.value = undefined
        const cards = await cardApi.my()
        if (!scope.current(ticket) || request !== generation)
          return
        card.value = cards.find(item => item.id === Number(cardId))
        if (!card.value) {
          throw new Error('卡片不存在')
        }
      }
      const result = parseCardLogsPage(await cardLogsApi.logs({ cardId, page: next, pageSize: 20 }))
      if (!scope.current(ticket) || request !== generation)
        return

      list.value = reset ? result.result : [...list.value, ...result.result]

      page = next

      finished.value = result.totalPage !== undefined ? page >= result.totalPage : result.result.length < 20
    }
    catch {
      if (scope.current(ticket) && request === generation) {
        retryReset = reset
        failed.value = true
      }
    }
    finally {
      if (scope.current(ticket) && request === generation) {
        loaded.value = true

        loading.value = false
      }
    }
  }

  /**
   * 调用既有演示操作并刷新当前卡片记录。
   * @param action 'consume' | 'refund'；演示消费或退款，服务端仍负责校验。
   * @returns Promise<void>；当前账号成功后刷新，失败显示提示。
   * @example
   * await page.demoAction('consume') // => 演示接口成功后刷新
   */
  async function demoAction(action: 'consume' | 'refund') {
    if (demoBusy.value || !card.value || !requireIdentity('customer'))
      return
    const ticket = scope.ticket()
    demoBusy.value = true
    try {
      await cardApi.demoAction(action, card.value.id)
      if (scope.current(ticket))
        await load(true)
    }
    catch (error) {
      if (scope.current(ticket))
        showError(error)
    }
    finally {
      if (scope.current(ticket))
        demoBusy.value = false
    }
  }
  /**
   * 校验路由卡号并清除旧卡片及旧请求状态。
   * @param query { cardId?: string }；正安全整数卡号字符串。
   * @returns Promise<void> | undefined；有效时加载第一页，无效时不请求。
   * @example
   * await page.init({ cardId: '-1' }) // => invalidCard 为 true
   */
  function init(query: { cardId?: string } = {}): Promise<void> | undefined {
    generation++
    cardId = query.cardId || ''
    invalidCard.value = !/^\d+$/.test(cardId) || !Number.isSafeInteger(Number(cardId)) || Number(cardId) <= 0
    list.value = []
    card.value = undefined
    loaded.value = false
    failed.value = false
    loading.value = false
    finished.value = false
    page = 0
    retryReset = true
    if (!invalidCard.value)
      return load(true)
  }

  /**
   * 重新查询卡片资料与第一页记录。
   * 无参数。
   * @returns Promise<void>；清除旧列表并加载，失败可重试。
   * @example
   * await page.refresh() // => 从第一页重新查询
   */
  function refresh(): Promise<void> {
    return load(true)
  }

  /**
   * 重试最近一次失败的查询阶段。
   * 无参数。
   * @returns Promise<void>；分页失败继续重试同一页。
   * @example
   * await page.retry() // => 重试失败页，不跳页
   */
  function retry(): Promise<void> {
    return load(retryReset)
  }

  /**
   * 加载下一页；加载中或已到底时跳过。
   * 无参数。
   * @returns Promise<void>；成功追加记录。
   * @example
   * await page.loadMore() // => 到底时不再请求
   */
  function loadMore(): Promise<void> {
    return load(false)
  }

  return { demoBusy, demoAction, card, list, loaded, failed, loading, invalidCard, hasMore, init, refresh, retry, loadMore }
}
