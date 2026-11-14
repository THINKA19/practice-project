import type { Ref } from 'vue'
import { computed, ref } from 'vue'
/** 按业务提供的标签过滤内存列表。@param options 数据、标签和匹配规则 @returns 当前标签、列表与计数 @example useTabFilter({ source, tabs, allKey: 0, match }) // 响应式列表 */
export function useTabFilter<T, K extends string | number>(options: { source: Ref<T[]>, tabs: { key: K, label: string }[], allKey: K, match: (item: T, key: K) => boolean }) {
  const activeIndex = ref(0)
  const key = computed(() => options.tabs[activeIndex.value]?.key ?? options.allKey)
  const list = computed(() => options.source.value.filter(item => key.value === options.allKey || options.match(item, key.value)))
  return { activeIndex, list, countByIndex: (index: number) => options.source.value.filter(item => options.tabs[index]?.key === options.allKey || options.match(item, options.tabs[index]?.key)).length }
}
