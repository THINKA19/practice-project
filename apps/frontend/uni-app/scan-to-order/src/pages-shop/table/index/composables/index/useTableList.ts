import { onHide, onShow } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'
import { useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { tableApi } from '../../api/table'
import { groupTables } from '../../models'
import type { TableGroup } from '../../models'

export function useTableList() {
  const context = useMerchantShopStore()
  const groups = ref<TableGroup[]>([])
  const activeCapacity = ref('')
  const error = ref('')
  const loading = ref(true)
  const loaded = ref(false)
  let visible = false
  let request = 0
  let reloadForContext = false

  const visibleGroups = computed(() => groups.value.filter(group => !activeCapacity.value || group.id === activeCapacity.value))
  const stats = computed(() => {
    const counts = { occupied: 0, vacant: 0 }
    for (const group of visibleGroups.value) {
      for (const table of group.tables) {
        if (table.occupancy !== 'unknown')
          counts[table.occupancy]++
      }
    }
    return counts
  })

  async function refresh(revalidate = true) {
    reloadForContext = false
    const started = ++request
    loading.value = true
    error.value = ''
    try {
      if (revalidate)
        await context.refresh()
      if (started !== request)
        return

      if (!context.can('table.read')) {
        groups.value = []
        loaded.value = false
        error.value = context.error || 'permission'
        return
      }

      const captured = context.capture('table.read')
      const result = await tableApi.list(captured)
      if (started !== request || !context.matches(captured))
        return

      groups.value = groupTables(result, captured.shopId)
        .map(group => ({ ...group, tables: group.tables.filter(table => table.occupancy !== 'unknown') }))
        .filter(group => group.tables.length > 0)
      if (!groups.value.some(group => group.id === activeCapacity.value))
        activeCapacity.value = ''
      loaded.value = true
    }
    catch {
      if (started === request)
        error.value = 'load'
    }
    finally {
      if (started === request)
        loading.value = false
    }
  }

  watch(() => context.revision, () => {
    ++request
    groups.value = []
    activeCapacity.value = ''
    error.value = ''
    loaded.value = false
    reloadForContext = visible
    loading.value = visible
  }, { flush: 'sync' })

  watch(() => [context.revision, context.loading] as const, () => {
    if (visible && reloadForContext && !context.loading)
      void refresh(false)
  })

  onShow(() => {
    visible = true
    void refresh()
  })
  onHide(() => {
    visible = false
    ++request
  })

  return { groups, activeCapacity, visibleGroups, stats, loading, loaded, error, refresh }
}
