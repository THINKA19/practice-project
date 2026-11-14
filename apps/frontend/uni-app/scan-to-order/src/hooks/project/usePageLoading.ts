import { computed, ref } from 'vue'

/**
 * 跟踪当前页面尚未结束的操作，配合 PageLoading 的遮罩展示。
 * @returns 加载状态和包裹异步操作的方法；并发操作全部结束后关闭。
 * @example const { loading, withLoading } = usePageLoading()
 */
export function usePageLoading() {
  const pending = ref(0)
  const loading = computed(() => pending.value > 0)

  async function withLoading<T>(action: () => Promise<T>): Promise<T> {
    pending.value++
    try {
      return await action()
    }
    finally {
      pending.value--
    }
  }

  return { loading, withLoading }
}
