import { mount } from '@vue/test-utils'
import ContactDock from '../index.vue'
import { effectScope } from 'vue'
import { expect, it, vi } from 'vitest'
import { useContactDockController } from '../composables/use-controller'

it('opens configured copy details and only copies when requested', () => {
  const scope = effectScope()
  const vm = scope.run(useContactDockController)!
  const clipboard = vi.fn()
  Object.assign(uni, { setClipboardData: clipboard })
  vm.activate({ id: 'custom', label: 'Custom contact', icon: 'message', color: '#fff', background: '#000', action: { type: 'copy', value: 'custom-id' } })
  expect(vm.showContact.value).toBe(true)
  expect(vm.selected.value?.action.value).toBe('custom-id')
  expect(clipboard).not.toHaveBeenCalled()
  vm.copy(vm.selected.value!.action.value)
  expect(clipboard).toHaveBeenCalledWith({ data: 'custom-id' })
  scope.stop()
})

it('始终展示全部联系方式，且不提供折叠按钮', async () => {
  const contacts = ['微信', 'Telegram', 'WhatsApp', 'Facebook'].map((label, index) => ({
    id: String(index),
    label,
    icon: 'message',
    color: '#333',
    background: '#fff',
    action: { type: 'copy' as const, value: label },
  }))
  const wrapper = mount(ContactDock, {
    props: { contacts, directoryLabel: '联系我们' },
    global: { stubs: { WdIcon: true, WechatContactPopup: true } },
  })
  try {
    await wrapper.find('.contact-directory').trigger('click')
    expect(wrapper.emitted('directory')).toHaveLength(1)
    expect(wrapper.findComponent({ name: 'WechatContactPopup' }).props('modelValue')).toBe(false)
    expect(wrapper.findAll('button.contact-button:not(.contact-directory)')).toHaveLength(contacts.length)
    expect(wrapper.findAll('button:not(.contact-directory) .contact-label').map(label => label.text())).toEqual(contacts.map(contact => contact.label))
    await wrapper.findAll('button:not(.contact-directory)')[0].trigger('click')
    expect(wrapper.findComponent({ name: 'WechatContactPopup' }).props('modelValue')).toBe(true)
    expect(wrapper.findAll('button:not(.contact-directory)')).toHaveLength(contacts.length)
  }
  finally {
    wrapper.unmount()
  }
})
