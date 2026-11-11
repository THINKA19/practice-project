/**
 * ============================================================================
 * 【文件概述】service/favorites/composables/use-page.ts，负责页面状态与交互编排。
 * 【方法与导出清单】useFavoritesPage
 * 【综合使用示例】
 * import { useFavoritesPage } from '@/pages/home/service/favorites/composables/use-page'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
import { onScopeDispose, ref, watch } from 'vue'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { favoritesApi } from '../api/favorites.api'
import type { FavoriteItem } from '../models/types'
import { toast } from '@/utils/project/feedback'
import { confirm } from '@/utils/project/interaction'

/**
 * 收藏分页和取消流程，旧账户响应及离页响应均丢弃。
 * 无参数。
 * @returns 按函数签名返回执行结果，响应式操作更新当前实例状态。
 * @example const page = useFavoritesPage() // 获取独立页面状态
 */
export function useFavoritesPage() {
  const session = useSessionState()
  const items = ref<FavoriteItem[]>([])
  const loading = ref(false)
  const failed = ref(false)
  const total = ref(0)
  const page = ref(0)
  const removing = ref<number | null>(null)
  let generation = 0
  let disposed = false

  /**
   * 刷新或追加下一页。
   * @param reset 由调用方传入的值，用于 load 操作。
   * @returns {void} 更新本函数所属的页面或模拟状态。
   * @example // load 的调用参数及接入位置见本文件顶部示例和所属页面。
   */
  async function load(reset = false) {
    if (disposed || (!reset && (loading.value || (page.value > 0 && items.value.length >= total.value))))
      return
    const ticket = ++generation
    const next = reset ? 1 : page.value + 1
    loading.value = true
    failed.value = false
    try {
      const data = await favoritesApi.list(next, 10)
      if (disposed || ticket !== generation)
        return
      items.value = reset ? data.list : [...items.value, ...data.list]
      total.value = data.total
      page.value = next
    }
    catch {
      if (ticket === generation && !disposed)
        failed.value = true
    }
    finally {
      if (ticket === generation && !disposed)
        loading.value = false
    }
  }
  /**
   * 取消收藏前确认，写入成功后重载列表。
   * @param item FavoriteItem，用于 remove 操作。
   * @returns {void} 更新本函数所属的页面或模拟状态。
   * @example // remove 的调用参数及接入位置见本文件顶部示例和所属页面。
   */
  async function remove(item: FavoriteItem) {
    if (removing.value !== null || !requireIdentity('customer'))
      return
    const account = session.sessionRevision
    removing.value = item.id
    try {
      const confirmed = await confirm({ title: '取消收藏', content: `确定取消收藏“${item.goodsName}”吗？` })
      if (!confirmed || disposed || account !== session.sessionRevision)
        return
      await favoritesApi.remove(item.id)
      if (!disposed && account === session.sessionRevision) {
        items.value = items.value.filter(row => row.id !== item.id)
        total.value = Math.max(0, total.value - 1)
        toast('已取消收藏')
        await load(true)
      }
    }
    catch (error) {
      if (!disposed && account === session.sessionRevision)
        toast(error instanceof Error ? error.message : '取消失败，请重试')
    }
    finally {
      if (account === session.sessionRevision)
        removing.value = null
    }
  }
  watch(() => session.sessionRevision, () => {
    generation++
    items.value = []
    page.value = 0
    total.value = 0
    removing.value = null
    void load(true)
  })
  onScopeDispose(() => {
    disposed = true
    generation++
  })
  return { items, loading, failed, total, removing, load, remove }
}
