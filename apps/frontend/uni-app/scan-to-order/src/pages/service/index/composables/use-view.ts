import { PageState } from '@/components/page-state'
import { ContactDock } from '@/components/contact-dock'
import { useServiceContacts } from './use-contacts'
import { currentLocale, t } from '@/locale'
import { ref, watch } from 'vue'
import { useServiceGalleryActions } from '../composables/use-gallery-actions'
import { useServiceGallery } from './use-gallery'

/** 页面状态与交互编排；每次调用拥有独立的页面实例。 */
export function useServiceView() {
  const galleryActions = useServiceGalleryActions()
  const contacts = useServiceContacts()
  const { groups, loading, failed, loadGallery } = useServiceGallery()
  function setTitle() {
    uni.setNavigationBarTitle({ title: t('service.title') })
  }
  const pageVisible = ref(false)
  onShow(() => {
    pageVisible.value = true
    setTitle()
    loadGallery()
  })
  onHide(() => {
    pageVisible.value = false
  })
  watch(currentLocale, () => {
    if (pageVisible.value)
      setTitle()
  })
  return { PageState, ContactDock, t, galleryActions, contacts, groups, loading, failed, loadGallery, setTitle, pageVisible }
}
