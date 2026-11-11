/**
 * ============================================================================
 * 【文件概述】service/group-buying/composables/use-page.ts，负责页面状态与交互编排。
 * 【方法与导出清单】useGroupBuyingPage
 * 【综合使用示例】
 * import { useGroupBuyingPage } from '@/pages/home/service/group-buying/composables/use-page'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
import { onScopeDispose, ref, watch } from 'vue'
import { useSessionState } from '@/pages/auth/session'
import { groupBuyingApi } from '../api/group-buying.api'
import type { GroupBuying } from '../models/types'
import { navigate } from '@/utils/project/navigation'
import { HomeServiceRoutes } from '../../routes'

const PAGE_SIZE = 10

/**
 * 团购列表分页与导航，页面卸载和账户变化后忽略旧响应。
 * 无参数。
 * @returns 按函数签名返回执行结果，响应式操作更新当前实例状态。
 * @example const page = useGroupBuyingPage() // 获取独立页面状态
 */
export function useGroupBuyingPage() {
  const session = useSessionState()
  const items = ref<GroupBuying[]>([])
  const loading = ref(false)
  const failed = ref(false)
  const total = ref(0)
  const finished = ref(false)
  let retryRefresh = true
  let page = 0
  let generation = 0
  let disposed = false
  /**
   * 刷新已加载的页，或在触底时追加下一页。
   * @param refresh 是否刷新已加载的页，首次打开时读取第一页。
   * @returns {void} 更新本函数所属的页面或模拟状态。
   * @example // load 的调用参数及接入位置见本文件顶部示例和所属页面。
   */
  async function load(refresh = false) {
    if (disposed || (!refresh && (loading.value || finished.value)))
      return
    const ticket = ++generation
    const first = refresh ? 1 : page + 1
    const last = refresh ? Math.max(1, page) : first
    const rows = refresh ? [] : [...items.value]
    loading.value = true
    failed.value = false
    try {
      let loadedPage = first
      let count = total.value
      let reachedEnd = false
      for (let next = first; next <= last; next++) {
        const data = await groupBuyingApi.list(next, PAGE_SIZE)
        if (disposed || ticket !== generation)
          return
        rows.push(...data.list)
        count = data.total
        loadedPage = next
        reachedEnd = data.list.length === 0 || rows.length >= count
        if (reachedEnd)
          break
      }
      items.value = rows
      total.value = count
      page = loadedPage
      finished.value = reachedEnd
    }
    catch {
      if (!disposed && ticket === generation) {
        retryRefresh = refresh
        failed.value = true
      }
    }
    finally {
      if (!disposed && ticket === generation)
        loading.value = false
    }
  }
  watch(() => session.sessionRevision, () => {
    generation++
    items.value = []
    total.value = 0
    finished.value = false
    page = 0
    void load(true)
  })
  onScopeDispose(() => {
    disposed = true
    generation++
  })
  return { items, loading, failed, total, finished, load, retry: () => load(retryRefresh), open: (id: number) => navigate(HomeServiceRoutes.groupBuyingDetail, { id }) }
}
