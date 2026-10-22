import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import { computed, ref } from 'vue'

/** Tab 定义：key 是过滤维度（也是唯一标识），label 只用于展示 */
export interface TabOption<K extends string | number = string> {
  /** 过滤维度：与数据字段直接比较 */
  key: K
  /** Tab 文案 */
  label: string
}

interface UseTabFilterOptions<T, K extends string | number> {
  /** 完整数据源（未过滤） */
  source: Ref<T[]>
  /** Tab 列表；tabs[0] 约定为「全部」 */
  tabs: TabOption<K>[]
  /** 命中判断；「全部」不会进入这里 */
  match: (item: T, key: K) => boolean
  /** 「全部」项的 key，默认取 tabs[0].key */
  allKey?: K
  /** 初始选中下标，默认 0 */
  initialIndex?: number
}

interface UseTabFilterReturn<T, K extends string | number> {
  /** 当前下标：给按下标 v-model 的 wd-tabs 用 */
  activeIndex: Ref<number>
  /** 当前 key：给按 key / name 绑定的 Tab 用，可直接赋值 */
  activeKey: WritableComputedRef<K>
  /** 当前 Tab 文案（空态提示等） */
  activeLabel: ComputedRef<string>
  /** 是否处于「全部」视图 */
  isAll: ComputedRef<boolean>
  /** 过滤后的列表 */
  list: ComputedRef<T[]>
  /** 某 key 命中条数（角标 / 统计） */
  countByKey: (key: K) => number
  /** 某下标命中条数（wd-tab 的 badge 只能拿到下标） */
  countByIndex: (index: number) => number
  /** 某 key 是否当前选中（自定义 Tab 高亮） */
  isActive: (key: K) => boolean
}

/**
 * 列表 Tab 过滤 hook（全项目唯一实现）
 *
 * 为什么必须集中：原先各列表页各自手写「Tab 数组 + activeIndex + filter + 角标计数」四件套，
 * 差异只在「拿哪个字段比」。结果是同一份逻辑存在 6 处，每加一个 Tab 都要同步改 4 处，
 * 常见漂移是「Tab 文案改了、过滤条件没改」——点了 Tab 列表不动，或角标数和列表条数对不上。
 *
 * 约定：
 *   - 只做客户端过滤。服务端分页过滤（券列表 / 福利中心）不走这里 —— 它们切 Tab 要重新请求
 *   - 「全部」由 allKey 表示（空串 / 'all' / 0 都行），不写进 match
 *   - Tab 的取值与文案由调用方按域定义（状态类取自 `@/constants/status`），本 hook 只管过滤
 *
 * @example
 * const { activeIndex, list, countByIndex } = useTabFilter<ShopOrder, number>({
 *   source: orders,
 *   tabs: SHOP_ORDER_TABS,
 *   allKey: 0,
 *   match: (order, key) => order.status === key,
 * })
 */
export function useTabFilter<T, K extends string | number = string>(
  options: UseTabFilterOptions<T, K>,
): UseTabFilterReturn<T, K> {
  const { source, tabs, match } = options
  if (tabs.length === 0)
    throw new RangeError('tabs 至少需要包含一个选项')
  const allKey = options.allKey ?? tabs[0].key
  const activeIndex = ref(options.initialIndex ?? 0)

  const activeKey = computed<K>({
    get: () => tabs[activeIndex.value]?.key ?? allKey,
    set: (key) => {
      const index = tabs.findIndex(tab => tab.key === key)
      // 未知 key 直接忽略：赋值方可能是组件的空值 / 上一次的旧值，不该把列表切成空
      if (index > -1)
        activeIndex.value = index
    },
  })

  const isAll = computed(() => activeKey.value === allKey)

  /**
   * 「全部」时返回浅拷贝而不是 source 本身
   * （外部拿到列表引用后 push / splice 会顺着污染源数据，这在原先几处 filter 写法里是刻意规避的）
   */
  const list = computed<T[]>(() =>
    isAll.value ? [...source.value] : source.value.filter(item => match(item, activeKey.value)),
  )

  const activeLabel = computed(() => tabs[activeIndex.value]?.label ?? '')

  function countByKey(key: K) {
    return key === allKey ? source.value.length : source.value.filter(item => match(item, key)).length
  }

  function countByIndex(index: number) {
    const key = tabs[index]?.key
    return key === undefined ? 0 : countByKey(key)
  }

  function isActive(key: K) {
    return activeKey.value === key
  }

  return { activeIndex, activeKey, activeLabel, isAll, list, countByKey, countByIndex, isActive }
}
