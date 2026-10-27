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
