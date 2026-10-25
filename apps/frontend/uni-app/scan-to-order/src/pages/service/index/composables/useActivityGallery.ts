import type { ActivityGalleryGroup } from '../models/service'
import { onScopeDispose, ref } from 'vue'
import { serviceApi } from '../api/service'
/** 页面拥有响应状态，取消对已销毁页面和迟到结果的写入。 */
export function useActivityGallery() {
  const groups = ref<ActivityGalleryGroup[]>([])
  const loading = ref(true)
  const failed = ref(false)
  let revision = 0
  onScopeDispose(() => {
    revision++
  })
  async function loadGallery() {
    const request = ++revision
    loading.value = true
    failed.value = false
    try {
      const result = await serviceApi.gallery()
      if (request === revision)
        groups.value = result.filter(group => group.images.length > 0)
    }
    catch {
      if (request === revision) {
        groups.value = []
        failed.value = true
      }
    }
    finally {
      if (request === revision)
        loading.value = false
    }
  }
  return { groups, loading, failed, loadGallery }
}
