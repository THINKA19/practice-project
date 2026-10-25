import type { ActivityGalleryGroup } from '../models/service'
import { onScopeDispose, ref } from 'vue'
import { serviceApi } from '../api/service'
/** 页面拥有响应状态，取消对已销毁页面和迟到结果的写入。 */
export function useActivityGallery() {
  const groups = ref<ActivityGalleryGroup[]>([])
  const loading = ref(true)
  let revision = 0
  onScopeDispose(() => {
    revision++
  })
  async function loadGallery() {
    const request = ++revision
    loading.value = true
    try {
      const result = await serviceApi.gallery()
      if (request === revision)
        groups.value = result
    }
    catch {
      if (request === revision)
        groups.value = []
    }
    finally {
      if (request === revision)
        loading.value = false
    }
  }
  return { groups, loading, loadGallery }
}
