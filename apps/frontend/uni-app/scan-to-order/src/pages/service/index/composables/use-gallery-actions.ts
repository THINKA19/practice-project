import type { ActivityGalleryGroup, ActivityGalleryImage } from '../models/types'
import { t } from '@/locale'
import { navigate } from '@/utils/project/navigation'

/** Platform and navigation integration stays outside the scrollable gallery. */
export function useServiceGalleryActions() {
  function preview(images: ActivityGalleryImage[], current: ActivityGalleryImage) {
    uni.previewImage({ urls: images.map(item => item.url), current: current.url })
  }
  function more(group: ActivityGalleryGroup) {
    if (group.moreUrl) {
      void navigate(group.moreUrl)
      return
    }
    uni.showToast({ title: t('service.more'), icon: 'none' })
  }
  return { preview, more }
}
