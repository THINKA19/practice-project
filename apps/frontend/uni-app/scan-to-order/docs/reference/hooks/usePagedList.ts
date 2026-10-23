// 历史参考资料：禁止正式业务导入；按需提取到正式模块后再接入和验证。
/** 项目分页扩展：仅忽略旧请求结果，不取消网络请求；fetcher 调用现有 API。 */
import { getCurrentScope, onScopeDispose, ref, shallowRef } from 'vue'
/**
 * 单页结果，totalPage 省略时通过条数判断结束。
 * @example const result: PageResult<string> = { list: ['a'], totalPage: 1 }
 */
export interface PageResult<T> { list: T[], totalPage?: number }
/**
 * 创建分页状态，refresh 替换旧查询，过期响应不会写入当前状态。
 * @param fetcher 页码、页大小对应的现有 API 取数函数。
 * @param pageSize 正整数页大小。
 * @returns 列表、错误、加载状态、刷新、更多和 dispose；错误由调用方决定是否提示。
 * @example const paging = usePagedList(async () => ({ list: ['a'] }))
 * await paging.refresh()
 */
export function usePagedList<T>(fetcher: (page: number, pageSize: number) => Promise<PageResult<T>>, pageSize = 20) {
  if (!Number.isSafeInteger(pageSize) || pageSize <= 0)
    throw new RangeError('pageSize 必须为正整数')
  const list = shallowRef<T[]>([])
  const error = shallowRef<unknown>()
  const loading = ref(false)
  const finished = ref(false)
  const loaded = ref(false)
  let page = 1
  let revision = 0
  let disposed = false

  async function load(reset = false) {
    if (disposed || (!reset && (loading.value || finished.value)))
      return
    if (reset) {
      page = 1
      list.value = []
      finished.value = false
      loaded.value = false
    }
    const started = ++revision
    const requestedPage = page

    loading.value = true
    error.value = undefined
    try {
      const result = await fetcher(requestedPage, pageSize)
      if (disposed || started !== revision)
        return
      if (!Array.isArray(result.list) || (result.totalPage !== undefined && (!Number.isInteger(result.totalPage) || result.totalPage < 0)))
        throw new TypeError('分页响应格式错误')
      list.value = requestedPage === 1 ? result.list : [...list.value, ...result.list]
      finished.value = result.totalPage === undefined ? result.list.length < pageSize : requestedPage >= result.totalPage
      page = requestedPage + 1
    }
    catch (e) {
      if (!disposed && started === revision)
        error.value = e
    }
    finally {
      if (!disposed && started === revision) {
        loading.value = false
        loaded.value = true
      }
    }
  }
  function dispose() {
    disposed = true
    revision++
    loading.value = false
  }
  if (getCurrentScope())
    onScopeDispose(dispose)
  return { list, error, loading, finished, loaded, refresh: () => load(true), loadMore: () => load(), dispose }
}
