import type { CardLog } from '../models/types'
import { ref } from 'vue'
import { cardApi } from './use-requests'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'

/** 按当前卡片加载消费明细，独立维护分页与错误状态，并隔离旧账号响应。 */
export function useCardLogsPage() {
  const list = ref<CardLog[]>([])

  const loaded = ref(false)

  const failed = ref(false)

  const loading = ref(false)

  let cardId = ''

  let page = 0

  let finished = false

  let generation = 0

  const scope = useSessionAccountScope(() => {
    generation++

    list.value = []

    loaded.value = false

    loading.value = false

    page = 0

    finished = false
  })

  async function load(reset: boolean) {
    if ((!reset && (loading.value || finished)) || !requireIdentity('customer') || !cardId)
      return

    const ticket = scope.ticket()

    const request = ++generation

    const next = reset ? 1 : page + 1

    loading.value = true

    failed.value = false

    try {
      const result = await cardApi.logs({ cardId, page: next, pageSize: 20 })

      if (!scope.current(ticket) || request !== generation)
        return

      list.value = reset ? result.result : [...list.value, ...result.result]

      page = next

      finished = result.totalPage !== undefined ? page >= result.totalPage : result.result.length < 20
    }
    catch {
      if (scope.current(ticket) && request === generation)
        failed.value = true
    }
    finally {
      if (scope.current(ticket) && request === generation) {
        loaded.value = true

        loading.value = false
      }
    }
  }

  return { list, loaded, failed, loading, init: (query: {
    cardId?: string
  } = {}) => {
    cardId = query.cardId || ''

    uni.setNavigationBarTitle({ title: '礼品卡明细' })

    return load(true)
  }, refresh: () => load(true), loadMore: () => load(false) }
}
