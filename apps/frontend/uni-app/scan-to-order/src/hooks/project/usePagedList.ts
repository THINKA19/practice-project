import type { PagedResult } from '@/utils/project/paged-response'
import { onScopeDispose, ref, shallowRef, watch } from 'vue'

/**
 * 分页去重、重试和迟到响应隔离；适用于 Vue 支持的各端。
 * @param fetchPage 调用方提供的分页请求，接收页码与每页数量。
 * @param options 响应式作用域标识及请求前准入检查，不在通用层选择业务身份。
 * @returns 独立列表状态、刷新与加载下一页方法。
 * @example usePagedList(fetchRows, { scopeKey: () => accountRevision.value, beforeLoad: canRead })
 */
export function usePagedList<T extends { id: number }>(fetchPage: (page: number, pageSize: number) => Promise<PagedResult<T>>, options: { scopeKey: () => unknown, beforeLoad: () => boolean }) {
  const list = shallowRef<T[]>([])
  const loading = ref(false)
  const finished = ref(false)
  const loaded = ref(false)
  const failed = ref(false)
  let page = 0
  let revision = 0
  let disposed = false
  function clear() {
    revision++
    list.value = []
    page = 0
    loading.value = false
    finished.value = false
    loaded.value = false
    failed.value = false
  }
  watch(options.scopeKey, clear, { flush: 'sync' })
  onScopeDispose(() => {
    disposed = true
    clear()
  })
  async function load(reset = false) {
    if (disposed || (!reset && (loading.value || finished.value)))
      return

    if (!options.beforeLoad()) {
      clear()
      return
    }
    if (reset)
      clear()
    const ticket = ++revision
    const account = options.scopeKey()
    const next = page + 1
    loading.value = true
    failed.value = false
    const current = () => !disposed && ticket === revision && account === options.scopeKey()
    try {
      const result = await fetchPage(next, 15)
      if (!current())
        return
      const rows = reset ? result.list : [...list.value, ...result.list]
      list.value = Array.from(new Map(rows.map(item => [item.id, item])).values())
      page = next
      finished.value = result.list.length === 0
        || (result.totalPage !== undefined
          ? next >= result.totalPage
          : result.totalRow !== undefined ? list.value.length >= result.totalRow : result.list.length < 15)
    }
    catch {
      if (current())
        failed.value = true
    }
    finally {
      if (current()) {
        loading.value = false
        loaded.value = true
      }
    }
  }
  return { scopeKey: options.scopeKey, list, loading, finished, loaded, failed, refresh: () => load(true), loadMore: () => load() }
}
