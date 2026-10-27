import { http } from '@/http/alova'
import { endpoints } from './endpoints'

export const assetsRequests = {
  summary(preview: boolean, token: string) {
    return http.Get<unknown>(preview ? endpoints.assetsPreview : endpoints.assets, {
      headers: preview ? {} : { Authorization: `Bearer ${token}` },
      cacheFor: 0,
      meta: { ignoreAuth: true, toast: false },
    }).send()
  },
}
