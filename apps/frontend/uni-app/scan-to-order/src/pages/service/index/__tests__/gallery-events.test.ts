import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import i18n from '@/locale'
import Gallery from '../components/Gallery/index.vue'

it('画廊把预览和更多操作交给调用方，组件不直接导航', async () => {
  const image = { url: '/sample.jpg', label: '图片' }
  const group = { id: 1, title: '分组', images: [image], moreUrl: '/somewhere' }
  const page = mount(Gallery, {
    props: { group, groupIndex: 0 },
    global: { plugins: [i18n], stubs: { WdImg: true, WdIcon: true } },
  })
  try {
    const more = page.findAll('view').find(view => view.classes().includes('justify-end'))!
    await more.trigger('click')
    expect(page.emitted('more')?.[0]).toEqual([group])
    const imageCard = page.findAll('view').find(view => view.classes().includes('h-312rpx'))!
    await imageCard.trigger('click')
    expect(page.emitted('preview')?.[0]).toEqual([[image], image])
    expect(uni.navigateTo).not.toHaveBeenCalled()
  }
  finally {
    page.unmount()
  }
})
