import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { expect, it, vi } from 'vitest'
import Panel from '../components/ProfileEditor/index.vue'

const mocks = vi.hoisted(() => ({
  session: { hasLogin: true, identity: 'customer', sessionRevision: 1, updateNowTime: vi.fn(), logout: vi.fn() },
  read: vi.fn().mockResolvedValue({ gender: 'unknown', birthday: '2000-06-15' }),
  save: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(mocks.session) }))
vi.mock('../composables/use-profile-requests', () => ({ profileApi: { read: mocks.read, save: mocks.save } }))
function mountPanel() {
  return mount(Panel, { global: { stubs: {
    'wd-popup': { props: ['modelValue'], template: '<div v-if="modelValue"><slot /></div>' },
  } } })
}
it('只编辑性别生日，整行立即打开滚轮，取消不回填，性别仅男和女', async () => {
  const wrapper = mountPanel()
  try {
    wrapper.vm.open()
    await flushPromises()
    expect(wrapper.findAll('input')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('昵称')
    expect(wrapper.text()).not.toContain('头像')
    expect(wrapper.text()).not.toContain('重新加载资料')
    await wrapper.find('.profile-row').trigger('tap')
    expect(wrapper.findAll('.selection-option').map(button => button.text())).toEqual(['男', '女'])
    await wrapper.findAll('.selection-option')[1].trigger('tap')
    expect(wrapper.find('.profile-row').text()).toContain('女')
    await wrapper.find('.birthday-row').trigger('tap')
    expect(wrapper.find('picker-view').exists()).toBe(true)
    expect(wrapper.findAll('picker-view-column')).toHaveLength(3)
    await wrapper.find('picker-view').trigger('change', { detail: { value: [101, 1, 2] } })
    await wrapper.find('.picker-action').trigger('tap')
    expect(wrapper.find('.birthday-row').text()).toContain('2000-06-15')
    await wrapper.find('.birthday-row').trigger('tap')
    await wrapper.find('picker-view').trigger('change', { detail: { value: [101, 1, 2] } })
    await wrapper.find('.picker-confirm').trigger('tap')
    expect(wrapper.find('.birthday-row').text()).toContain('2001-02-03')
    await wrapper.find('.save-button').trigger('tap')
    await flushPromises()
    expect(mocks.save).toHaveBeenCalledWith({ gender: 'female', birthday: '2001-02-03' })
  }
  finally { wrapper.unmount() }
})
it('切换到非闰年时自动限制日期，清空生日可保存', async () => {
  const wrapper = mountPanel()
  try {
    wrapper.vm.open()
    await flushPromises()
    await wrapper.find('.birthday-row').trigger('tap')
    await wrapper.find('picker-view').trigger('change', { detail: { value: [101, 1, 30] } })
    await wrapper.find('.picker-confirm').trigger('tap')
    expect(wrapper.find('.birthday-row').text()).toContain('2001-02-28')
    await wrapper.find('.clear-birthday').trigger('tap')
    await wrapper.find('.save-button').trigger('tap')
    await flushPromises()
    expect(mocks.save).toHaveBeenLastCalledWith({ gender: 'unknown', birthday: '' })
  }
  finally { wrapper.unmount() }
})
it('资料加载前后保持相同布局，不先显示另一个加载面板', async () => {
  let resolve!: (value: { gender: string, birthday: string }) => void
  mocks.read.mockReturnValueOnce(new Promise((done) => {
    resolve = done
  }))
  const wrapper = mountPanel()
  try {
    wrapper.vm.open()
    await flushPromises()
    expect(wrapper.findAll('.profile-row')).toHaveLength(2)
    expect(wrapper.find('.profile-fields').classes()).toContain('is-loading')
    expect(wrapper.text()).not.toContain('正在加载')
    expect(wrapper.find('.save-button').attributes('disabled')).toBeDefined()
    resolve({ gender: 'female', birthday: '2000-06-15' })
    await flushPromises()
    expect(wrapper.findAll('.profile-row')).toHaveLength(2)
    expect(wrapper.find('.profile-fields').classes()).not.toContain('is-loading')
  }
  finally { wrapper.unmount() }
})
it('退出确认层高于资料遮罩，取消后可直接再次操作', async () => {
  const wrapper = mountPanel()
  try {
    wrapper.vm.open()
    await flushPromises()
    await wrapper.find('.logout-button').trigger('tap')
    expect(wrapper.find('.logout-confirm__message').text()).toBe('确定退出当前账号吗？')
    expect(wrapper.find('.logout-confirm').exists()).toBe(true)
    await wrapper.find('.logout-cancel').trigger('tap')
    expect(wrapper.find('.logout-confirm').exists()).toBe(false)
    expect(wrapper.find('.profile-row').attributes('disabled')).toBeUndefined()
    await wrapper.find('.profile-row').trigger('tap')
    expect(wrapper.findAll('.selection-option')).toHaveLength(2)
    await wrapper.find('.selection-cancel').trigger('tap')
    await wrapper.find('.logout-button').trigger('tap')
    expect(wrapper.find('.logout-confirm').exists()).toBe(true)
    expect(uni.showModal).not.toHaveBeenCalled()
  }
  finally { wrapper.unmount() }
})
