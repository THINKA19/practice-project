/**
 * ============================================================================
 * 【文件概述】菜单公告详情流程；负责 URL 边界、响应转换和迟到请求隔离。
 * 【方法与导出清单】useOrderingNoticeDetailPage：独立的消息、加载、错误与重试状态。
 * 【综合使用示例】
 * import { useOrderingNoticeDetailPage } from './composables/use-notice-detail-page'
 * const vm = useOrderingNoticeDetailPage()
 * await vm.init({ id: '1' }) // => 后端存在该消息时更新 message；否则保留空状态
 * ============================================================================
 */
import { getCurrentScope, onScopeDispose, ref } from 'vue'
import type { OrderingNotice } from '../models/types'
import { normalizeNotices } from '../models/notices'
import { orderingContentApi } from '../api/content.api'

/**
 * 创建公告详情实例；无参数，页面销毁后丢弃在途响应。
 * @returns 消息快照、加载/错误状态、初始化及重试方法；请求失败由 error 表达。
 * @example
 * const vm = useOrderingNoticeDetailPage()
 * await vm.init({ id: '0' }) // => message 为 null，不发请求
 */
export function useOrderingNoticeDetailPage() {
  const message = ref<OrderingNotice | null>(null)
  const loading = ref(false)
  const error = ref('')
  let messageId = 0
  let requestVersion = 0
  if (getCurrentScope())
    onScopeDispose(() => { requestVersion++ })

  /**
   * 读取当前有效消息；失败允许重试，旧响应不更新当前实例。
   * @returns Promise<void>，更新当前消息或错误状态；无参数。
   * @example await load() // => 当前有效 id 对应的消息快照或错误提示
   */
  async function load() {
    if (!messageId)
      return
    const version = ++requestVersion
    loading.value = true
    error.value = ''
    try {
      const list = normalizeNotices(await orderingContentApi.notices())
      if (version === requestVersion)
        message.value = list.find(item => item.id === messageId) ?? null
    }
    catch (cause) {
      if (version === requestVersion)
        error.value = cause instanceof Error ? cause.message : '消息加载失败，请重试'
    }
    finally {
      if (version === requestVersion)
        loading.value = false
    }
  }

  /**
   * 校验页面编号，清空旧消息后加载。
   * @param query 页面查询参数；id 必须可转换为正安全整数。
   * @returns Promise<void>，无效编号只清理状态，不请求后端。
   * @example await init({ id: '-1' }) // => 空消息状态
   */
  async function init(query: { id?: string } = {}) {
    requestVersion++
    message.value = null
    error.value = ''
    loading.value = false
    const id = Number(query.id)
    messageId = Number.isSafeInteger(id) && id > 0 ? id : 0
    await load()
  }

  return { message, loading, error, init, load }
}
