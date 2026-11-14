import type { SessionIdentity } from '../models/types'
import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import IdentitySwitch from '../components/IdentitySwitch/index.vue'
import { sessionApi } from '../api/session'
import { getIdentity } from '../composables/use-actions'
import { seedSession } from './fixtures'
import { setLocale } from '@/locale'

vi.mock('../api/session', () => ({ sessionApi: { logout: vi.fn() } }))
vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))

const roles = { customer: '顾客', shop: '商家', rider: '骑手' }
const identities = Object.keys(roles) as SessionIdentity[]
const switches = identities.flatMap(current => identities
  .filter(target => target !== current)
  .map(target => [current, target] as const))

function open(target: SessionIdentity) {
  setLocale('zh-Hans')
  return mount(IdentitySwitch, {
    props: { target },
    slots: { default: '<div class="login-form">登录表单</div>' },
    global: { stubs: { 'wd-button': { template: '<button><slot /></button>' } } },
  })
}

it.each(switches)('%s 到 %s 共用提示，取消保留会话，确认后显示目标登录表单', async (current, target) => {
  seedSession({}, current)
  vi.stubGlobal('getCurrentPages', () => [{}, {}])
  const wrapper = open(target)
  try {
    expect(wrapper.text()).toContain(`你当前以「${roles[current]}」身份登录`)
    expect(wrapper.text()).toContain(`退出并前往${roles[target]}登录`)
    expect(wrapper.find('.login-form').exists()).toBe(false)

    const [confirm, cancel] = wrapper.findAll('button')
    await cancel.trigger('tap')
    expect(uni.navigateBack).toHaveBeenCalledOnce()
    expect(getIdentity()).toBe(current)
    expect(sessionApi.logout).not.toHaveBeenCalled()

    await confirm.trigger('click')
    await flushPromises()
    expect(sessionApi.logout).toHaveBeenCalledExactlyOnceWith(current, 'old')
    expect(getIdentity()).toBeNull()
    expect(wrapper.find('.login-form').exists()).toBe(true)
  }
  finally {
    wrapper.unmount()
    vi.unstubAllGlobals()
  }
})

it('会话已过期时直接显示目标登录表单', () => {
  seedSession({}, 'rider').snapshot!.expiresAt = Date.now() - 1
  const wrapper = open('customer')
  try {
    expect(wrapper.find('.login-form').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(false)
  }
  finally {
    wrapper.unmount()
  }
})
