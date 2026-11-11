import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { ref } from 'vue'
import LogList from '../components/LogList/index.vue'
import type { useCardLogsPage } from '../composables/use-page'

it('明细末页展示到底提示，空列表与加载失败不显示到底', () => {
  const vm = {
    card: ref({ id: 1, cardId: 1, amount: 50, type: 1, status: 0 }),
    list: ref([{ id: 1, amount: 10, eventType: 'refund', direction: 'credit', dateAdd: '' }]),
    loaded: ref(true),
    failed: ref(false),
    loading: ref(false),
    invalidCard: ref(false),
    hasMore: ref(false),
    demoBusy: ref(false),
    demoAction: vi.fn(),
    loadMore: vi.fn(),
    retry: vi.fn(),
  } as unknown as ReturnType<typeof useCardLogsPage>
  const page = mount(LogList, { props: { vm } })
  expect(page.text()).toContain('退款返还')
  expect(page.text()).toContain('+¥10')
  expect(page.text()).toContain('已经到底了')
  page.unmount()
  vm.list.value = []
  const empty = mount(LogList, { props: { vm } })
  expect(empty.text()).toContain('暂无明细记录')
  expect(empty.text()).not.toContain('已经到底了')
  empty.unmount()
  vm.failed.value = true
  const failed = mount(LogList, { props: { vm } })
  expect(failed.text()).toContain('明细加载失败')
  expect(failed.text()).not.toContain('已经到底了')
  failed.unmount()
})
