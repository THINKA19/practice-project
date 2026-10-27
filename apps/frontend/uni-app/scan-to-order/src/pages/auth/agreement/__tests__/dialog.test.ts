import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import Dialog from '../components/ConsentDialog/index.vue'

it('弹窗只展示传入内容并发出操作，不自行导航或保存同意状态', async () => {
  const page = mount(Dialog, {
    props: {
      visible: true,
      title: '自定义确认',
      paragraphs: ['由调用方提供的说明'],
      readLabel: '阅读全文',
      acceptLabel: '同意',
      rejectLabel: '暂不同意',
    },
    global: { stubs: { WdPopup: { template: '<section><slot /></section>' } } },
  })
  try {
    expect(page.text()).toContain('由调用方提供的说明')
    await page.find('.privacy-button--reject').trigger('tap')
    expect(page.emitted('reject')).toHaveLength(1)
    await page.find('#privacy-consent-agree').trigger('agreeprivacyauthorization')
    expect(page.emitted('accept')).toHaveLength(1)
    await page.findAll('view').find(view => view.text() === '阅读全文')!.trigger('tap')
    expect(page.emitted('read')).toHaveLength(1)
    expect(vi.mocked(uni.navigateTo)).not.toHaveBeenCalled()
    await page.setProps({ paragraphs: ['更新后的说明'] })
    expect(page.text()).toContain('更新后的说明')
    expect(page.text()).not.toContain('由调用方提供的说明')
  }
  finally {
    page.unmount()
  }
})
