import { effectScope } from 'vue'
import { expect, it, vi } from 'vitest'
import { useActivityGallery } from '../composables/useActivityGallery'

const gallery = vi.hoisted(() => vi.fn())
vi.mock('../api/service', () => ({ serviceApi: { gallery } }))

it('distinguishes successful empty data from failure and recovers on the next visit', async () => {
  const scope = effectScope()
  const vm = scope.run(useActivityGallery)!
  gallery.mockResolvedValueOnce([{ id: 1, title: 'Empty group', images: [] }])
  await vm.loadGallery()
  expect(vm.failed.value).toBe(false)
  expect(vm.groups.value).toEqual([])
  gallery.mockRejectedValueOnce(new Error('offline'))
  await vm.loadGallery()
  expect(vm.failed.value).toBe(true)
  expect(vm.loading.value).toBe(false)
  gallery.mockResolvedValueOnce([])
  await vm.loadGallery()
  expect(vm.failed.value).toBe(false)
  scope.stop()
})
