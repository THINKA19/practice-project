import { expect, it } from 'vitest'
import { ref } from 'vue'
import { useTabFilter } from './useTabFilter'

it('可写 key 同步下标、列表与计数，未知 key 不改变选择', () => {
  const filter = useTabFilter<number, number>({
    source: ref([1, 2, 2]),
    tabs: [{ key: 0, label: '全部' }, { key: 2, label: '二' }],
    match: (item, key) => item === key,
  })
  filter.activeKey.value = 2
  expect(filter.activeIndex.value).toBe(1)
  expect(filter.list.value).toEqual([2, 2])
  expect(filter.countByIndex(1)).toBe(2)
  filter.activeKey.value = 99
  expect(filter.activeKey.value).toBe(2)
})

it('空 tabs 明确报错', () => {
  expect(() => useTabFilter({ source: ref([]), tabs: [], match: () => true })).toThrow(RangeError)
})
