import { onScopeDispose, ref } from 'vue'
import type { CmsPage } from '../models/types'
import { cmsApi } from './use-requests'
import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'
import { toast } from '@/utils/project/interaction'
/** CMS 加载失败、空内容分别展示，支持重试及联系入口。 */
export function useAboutPage() {
  const page = ref<CmsPage | null>(null)

  const loading = ref(false)

  const failed = ref(false)

  let key = 'about'

  let generation = 0

  onScopeDispose(() => generation++)

  async function init(query: { key?: string } = {}) {
    key = query.key || key

    const ticket = ++generation

    loading.value = true

    failed.value = false

    page.value = null

    try {
      const data = await cmsApi.cmsPage(key)

      if (ticket !== generation)
        return

      page.value = data

      uni.setNavigationBarTitle({ title: data?.info?.title || '关于我们' })
    }
    catch {
      if (ticket === generation)
        failed.value = true
    }
    finally {
      if (ticket === generation)
        loading.value = false
    }
  }

  async function contactService() {
    const result = await navigate(ClientRoutes.Account.contact)

    if (!result.ok)
      toast('打开客服失败，请重试')
  }

  function copyContact() {
    const contact = page.value?.info?.contact

    if (typeof contact !== 'string' || !contact.trim())
      return toast('暂无联系方式，请进入在线客服')

    uni.setClipboardData({ data: contact, fail: () => toast('复制失败') })
  }

  return { page, demo: import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true', loading, failed, init, copyContact, contactService }
}
