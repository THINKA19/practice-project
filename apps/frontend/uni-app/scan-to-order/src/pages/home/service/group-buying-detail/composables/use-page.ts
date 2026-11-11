/**
 * ============================================================================
 * 【文件概述】service/group-buying-detail/composables/use-page.ts，负责页面状态与交互编排。
 * 【方法与导出清单】useGroupBuyingDetailPage
 * 【综合使用示例】
 * import { useGroupBuyingDetailPage } from '@/pages/home/service/group-buying-detail/composables/use-page'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
import { computed, onScopeDispose, ref, watch } from 'vue'
import { groupBuyingApi } from '../../group-buying'
import type { GroupBuying } from '../../group-buying'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { toast } from '@/utils/project/feedback'
/**
 * 团购详情、倒计时和防重复参团流程。
 * 无参数。
 * @returns 按函数签名返回执行结果，响应式操作更新当前实例状态。
 * @example const page = useGroupBuyingDetailPage() // 获取独立页面状态
 */
export function useGroupBuyingDetailPage() {
  const session = useSessionState()
  const item = ref<GroupBuying | null>(null)
  const loading = ref(false)
  const failed = ref(false)
  const joining = ref(false)
  const now = ref(Date.now())
  let id = 0
  let generation = 0
  let disposed = false
  const timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
  const ended = computed(() => Boolean(item.value && item.value.endsAt <= now.value))
  const remaining = computed(() => {
    if (!item.value)
      return ''
    const seconds = Math.max(0, Math.floor((item.value.endsAt - now.value) / 1000))
    return `${Math.floor(seconds / 3600)}小时 ${Math.floor(seconds % 3600 / 60)}分 ${seconds % 60}秒`
  })
  const canJoin = computed(() => Boolean(item.value && !ended.value && !loading.value && !failed.value && !item.value.participating && item.value.joined < item.value.people && !joining.value))
  /**
   * 读取团购详情，非法参数直接进入失败状态。
   * 无参数。
   * @returns {void} 更新本函数所属的页面或模拟状态。
   * @example // refresh 的调用参数及接入位置见本文件顶部示例和所属页面。
   */
  async function refresh() {
    if (disposed || joining.value)
      return
    const ticket = ++generation
    failed.value = false
    if (!Number.isSafeInteger(id) || id <= 0) {
      failed.value = true
      return
    }
    loading.value = true
    try {
      const data = await groupBuyingApi.detail(id)
      if (!disposed && ticket === generation)
        item.value = data
    }
    catch {
      if (!disposed && ticket === generation)
        failed.value = true
    }
    finally {
      if (!disposed && ticket === generation)
        loading.value = false
    }
  }
  /**
   * 提交参团，成功后展示服务端确认的当前进度。
   * 无参数。
   * @returns {void} 更新本函数所属的页面或模拟状态。
   * @example // join 的调用参数及接入位置见本文件顶部示例和所属页面。
   */
  async function join() {
    if (!canJoin.value || !requireIdentity('customer'))
      return
    const ticket = generation
    joining.value = true
    try {
      const data = await groupBuyingApi.join(id)
      if (!disposed && ticket === generation) {
        item.value = data
        toast(data.joined >= data.people ? '参团成功，已成团' : '参团成功，等待其他成员加入')
      }
    }
    catch (error) {
      if (!disposed && ticket === generation)
        toast(error instanceof Error ? error.message : '参团失败，请重试')
    }
    finally {
      if (!disposed && ticket === generation)
        joining.value = false
    }
  }
  watch(() => session.sessionRevision, () => {
    generation++
    item.value = null
    joining.value = false
    void refresh()
  })
  onScopeDispose(() => {
    disposed = true
    generation++
    clearInterval(timer)
  })
  return { item, loading, failed, joining, ended, remaining, canJoin, refresh, join, init: (value: unknown) => {
    id = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : 0
    return refresh()
  } }
}
