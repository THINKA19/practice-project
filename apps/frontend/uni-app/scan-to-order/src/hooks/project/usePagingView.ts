import { nextTick, onScopeDispose, ref, watch } from 'vue'
import type { Ref } from 'vue'

interface PagingControl {
  reload: () => Promise<unknown> | void
  completeByNoMore: (rows: unknown[], noMore: boolean, success?: boolean) => Promise<unknown>
}

/**
 * 将调用方列表接入现有 z-paging；滚动与刷新样式由组件处理，适用于项目现有各端。
 * @param source 分页动作与状态，scopeKey 可用于账号切换时重载。
 * @param rows 当前列表的只读访问器。
 * @returns z-paging 引用、查询回调与重载方法。
 * @example usePagingView(vm, () => vm.list.value)
 */
export function usePagingView(source: {
  scopeKey?: () => unknown
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
  finished: Ref<boolean>
  failed: Ref<boolean>
}, rows: () => readonly unknown[]) {
  const paging = ref<PagingControl>()

  let revision = 0
  let disposed = false
  function reload() {
    const ticket = ++revision
    return nextTick(() => {
      if (!disposed && ticket === revision)
        return Promise.resolve(paging.value?.reload()).catch(() => {})
    })
  }
  if (source.scopeKey)
    watch(source.scopeKey, reload, { flush: 'post' })
  onScopeDispose(() => {
    disposed = true
    revision++
  })
  async function query(pageNo: number) {
    const ticket = ++revision
    const offset = pageNo === 1 ? 0 : rows().length
    await (pageNo === 1 ? source.refresh() : source.loadMore())
    if (disposed || ticket !== revision)
      return
    // z-paging 在失败完成时会 reject，错误样式已由组件处理。
    await paging.value?.completeByNoMore(Array.from(rows()).slice(offset), source.finished.value, !source.failed.value).catch(() => {})
  }
  return { paging, query, reload }
}
