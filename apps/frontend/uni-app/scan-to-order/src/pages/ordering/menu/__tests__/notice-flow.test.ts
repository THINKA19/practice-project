import { shallowMount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { normalizeNotices } from '../models/notices'
import { notices } from '../mock/fixtures/notices'
import NoticeBar from '../components/NoticeBar/index.vue'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())
it('兼容旧单条公告和多条消息，空状态与非法返回有明确结果', () => {
  expect(normalizeNotices(notices)).toHaveLength(3)
  expect(normalizeNotices(notices[0])).toEqual([notices[0]])
  expect(normalizeNotices(null)).toEqual([])
  expect(() => normalizeNotices([{ id: 1, title: '缺少正文' }])).toThrow('公告数据格式不正确')
})
it('公告仅上下轮播，点击哪条就发出哪条消息', async () => {
  const wrapper = shallowMount(NoticeBar, {
    props: { notices },
    global: { stubs: { 'wd-icon': true, 'swiper': { template: '<div class="test-swiper"><slot /></div>' }, 'swiper-item': { template: '<div class="test-swiper-item"><slot /></div>' } }, config: { compilerOptions: { isCustomElement: (tag: string) => ['view', 'text', 'swiper', 'swiper-item'].includes(tag) } } },
  })
  expect(wrapper.find('.test-swiper').attributes()).toHaveProperty('vertical')
  expect(wrapper.findAll('.test-swiper-item')).toHaveLength(3)
  await wrapper.findAll('.notice-item')[1].trigger('tap')
  expect(wrapper.emitted('open')).toEqual([[notices[1]]])
  expect(wrapper.find('.test-swiper').find('.notice-chevron').exists()).toBe(false)
  expect(wrapper.findAll('.notice-chevron')).toHaveLength(1)
  await wrapper.find('.test-swiper').trigger('change', { detail: { current: 2 } })
  await wrapper.find('.notice-more').trigger('tap')
  expect(wrapper.emitted('open')?.[1]).toEqual([notices[2]])
  wrapper.unmount()
})
it('公开公告接口返回三条不同正文，不要求建立登录会话', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { orderingContentApi } = await import('../api/content.api')
  const result = normalizeNotices(await orderingContentApi.notices())
  expect(result.map(item => item.id)).toEqual([1, 2, 3])
  expect(new Set(result.map(item => item.content)).size).toBe(3)
}, 20000)
