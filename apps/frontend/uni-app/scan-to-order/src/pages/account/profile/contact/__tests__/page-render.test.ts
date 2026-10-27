import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import { parseServiceConfig } from '../models/mappers'
import ContactChannelCard from '../components/ContactChannelCard/index.vue'

const actions = vi.hoisted(() => ({ copy: vi.fn(), previewQr: vi.fn(), load: vi.fn(), openLink: vi.fn() }))
const data = parseServiceConfig({ demo: true, channels: [{ kind: 'qq_group', name: '客服 QQ 群', account: 'DEMO_GROUP', qr_image: '/static/group.png', primary: true }, { kind: 'telegram', account: '@DEMO_TELEGRAM', qr_image: '/static/telegram.png', link: 'https://example.invalid/telegram' }] })
vi.mock('@dcloudio/uni-app', () => ({ onLoad: vi.fn() }))
vi.mock('../composables/use-config', () => ({ useContactConfig: () => {
  const expanded = ref([data.channels[0].id])
  return { serviceData: ref(data), recommendedId: ref(data.channels[0].id), canOpenLinks: ref(true), nativeContactAvailable: ref(false), isExpanded: (id: string) => expanded.value.includes(id), toggleChannel: (id: string) => {
    expanded.value = expanded.value.includes(id) ? expanded.value.filter(value => value !== id) : [...expanded.value, id]
  }, loaded: ref(true), loading: ref(false), failed: ref(false), qrErrors: ref({}), markQrFailed: vi.fn(), retryQr: vi.fn(), showTelTips: vi.fn(), ...actions }
} }))
afterEach(() => vi.unstubAllGlobals())
it('推荐渠道默认展开，复制按钮紧凑，点击二维码预览，其他渠道可展开', async () => {
  vi.stubGlobal('definePage', vi.fn())
  const Page = (await import('../index.vue')).default
  const wrapper = mount(Page)
  try {
    expect(wrapper.text()).toContain('开发演示')
    expect(wrapper.findAll('image')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('查看二维码')
    const copy = wrapper.findAll('button').find(button => button.text() === '复制群号')!
    expect(copy.classes()).toContain('compact-button')
    await copy.trigger('tap')
    expect(actions.copy).toHaveBeenCalledWith('DEMO_GROUP')
    await wrapper.find('image').trigger('tap')
    expect(actions.previewQr).toHaveBeenCalledWith(expect.objectContaining({ account: 'DEMO_GROUP' }))
    await wrapper.find('button[aria-label="展开Telegram"]').trigger('tap')
    expect(wrapper.findAll('image')).toHaveLength(2)
    expect(wrapper.text()).toContain('https://example.invalid/telegram')
    expect(wrapper.findAll('button').find(button => button.text().includes('打开 Telegram'))!.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).not.toContain('电话客服')
  }
  finally { wrapper.unmount() }
})
it('facebook 主页与 Messenger 分别展示并触发不同链接，X 不伪装为私聊入口', async () => {
  const channel = parseServiceConfig({ channels: [{ kind: 'facebook', account: 'Brand', link: 'https://www.facebook.com/brand', contact_link: 'https://m.me/brand' }] }).channels[0]
  const wrapper = mount(ContactChannelCard, { props: { channel, expanded: true, recommended: false, demo: false, qrFailed: false, canOpenLinks: true } })
  try {
    await wrapper.findAll('button').find(button => button.text() === '访问 Facebook 主页')!.trigger('tap')
    await wrapper.findAll('button').find(button => button.text() === 'Messenger 私信')!.trigger('tap')
    expect(wrapper.emitted('open')).toEqual([['https://www.facebook.com/brand'], ['https://m.me/brand']])
    await wrapper.setProps({ channel: { ...channel, kind: 'x', name: 'X', contact_link: '', link: 'https://x.com/brand' } })
    expect(wrapper.text()).toContain('访问 X 主页')
    expect(wrapper.text()).not.toContain('Messenger')
    await wrapper.setProps({ canOpenLinks: false })
    expect(wrapper.text()).not.toContain('访问 X 主页')
    expect(wrapper.text()).toContain('复制链接')
  }
  finally { wrapper.unmount() }
})
