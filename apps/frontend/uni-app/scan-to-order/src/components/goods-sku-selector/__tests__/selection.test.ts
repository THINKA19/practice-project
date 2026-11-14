import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import GoodsSkuSelector from '../index.vue'
import { useSkuSelector } from '../use-sku-selector'
import type { SkuGroup } from '../types'

describe('goods-sku-selector', () => {
  it('uses IDs for duplicate names, rejects disabled choices and keeps instances independent', () => {
    const groups = ref<SkuGroup[]>([{ id: 1, name: '份量', required: true, choices: [
      { id: 11, name: '大份', active: false },
      { id: 12, name: '大份', active: false, disabled: true },
    ] }])
    const selected = vi.fn()
    const first = useSkuSelector(() => groups.value, selected)
    const second = useSkuSelector(() => [], vi.fn())
    expect(first.complete.value).toBe(false)
    first.select(1, 12)
    first.select(2, 11)
    expect(selected).not.toHaveBeenCalled()
    first.select(1, 11)
    expect(selected).toHaveBeenCalledWith(1, 11)
    groups.value[0].choices[0].active = true
    expect(first.complete.value).toBe(true)
    expect(first.selectedNames.value).toEqual(['大份'])
    expect(second.selectedNames.value).toEqual([])
  })
  it('renders prices and emits choice IDs without mutating controlled values', async () => {
    const groups = [{ id: 1, name: '份量', choices: [{ id: 11, name: '小份', active: false, price: 4.8 }] }]
    const wrapper = mount(GoodsSkuSelector, { props: { groups } })
    expect(wrapper.text()).toContain('4.8')
    await wrapper.find('.sku-choice').trigger('tap')
    expect(wrapper.emitted('select')).toEqual([[1, 11]])
    expect(groups[0].choices[0].active).toBe(false)
  })
})
