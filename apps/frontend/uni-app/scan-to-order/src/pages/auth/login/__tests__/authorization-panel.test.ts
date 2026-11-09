import { flushPromises, mount } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import { expect, it, vi } from 'vitest'
import Panel from '../components/AuthPanel/index.vue'

const mocks = vi.hoisted(() => ({
  session: { hasLogin: false, sessionRevision: 1 },
  authorize: vi.fn().mockResolvedValue(true),
  redirect: vi.fn(),
  demo: false,
  channel: 'mini',
}))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(mocks.session), redirectToLogin: mocks.redirect, AUTH_ROUTES: { customer: '/pages/auth/login/index' } }))
vi.mock('../composables/use-wechat-authorization', () => ({
  useLoginWechatAuthorization: () => ({ loading: ref(false), error: ref(''), demo: mocks.demo, authorize: mocks.authorize }),
}))
vi.mock('../composables/use-wechat-environment', () => ({ getWechatEnvironment: () => ({ channel: mocks.channel, mobileBrowser: false }) }))
vi.mock('../components/AgreementConsent/index.vue', () => ({ default: {
  props: ['modelValue', 'disabled'],
  emits: ['update:modelValue'],
  template: '<button class="consent" @click="$emit(\'update:modelValue\', true)">同意协议</button>',
} }))

it('授权面板要求同意协议，授权失败保留重试，成功关闭', async () => {
  const wrapper = mount(Panel, { global: { stubs: {
    'wd-popup': { props: ['modelValue'], template: '<div v-if="modelValue"><slot /></div>' },
  } } })
  try {
    wrapper.vm.open()
    await flushPromises()
    expect(wrapper.text()).not.toContain('演示')
    expect(wrapper.text()).not.toContain('手机号')
    expect(wrapper.find('.authorize-button').text()).toBe('授权登录')
    expect(wrapper.find('.authorize-button').attributes('disabled')).toBeDefined()
    reactive(mocks.session).sessionRevision++
    await flushPromises()
    expect(wrapper.text()).toContain('微信授权登录')
    expect(wrapper.text()).not.toContain('个人资料')
    await wrapper.find('.consent').trigger('click')
    mocks.authorize.mockResolvedValueOnce(false)
    await wrapper.find('.authorize-button').trigger('tap')
    await flushPromises()
    expect(wrapper.text()).toContain('微信授权登录')
    await wrapper.find('.authorize-button').trigger('tap')
    await flushPromises()
    expect(mocks.authorize).toHaveBeenCalledWith()
    expect(wrapper.text()).toBe('')
  }
  finally { wrapper.unmount() }
})

it.each([false, true])('routes PC to the full login page with mock=%s without authorizing', async (demo) => {
  mocks.demo = demo
  mocks.channel = 'web'
  mocks.authorize.mockClear()
  mocks.redirect.mockClear()
  const wrapper = mount(Panel, { global: { stubs: { 'wd-popup': { template: '<div />' } } } })
  try {
    wrapper.vm.open()
    await flushPromises()
    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith({ identity: 'customer' })
    expect(wrapper.find('.authorize-button').exists()).toBe(false)
    expect(mocks.authorize).not.toHaveBeenCalled()
  }
  finally {
    wrapper.unmount()
    mocks.demo = false
    mocks.channel = 'mini'
  }
})
