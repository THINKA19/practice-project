import type { BannerDto as Banner } from './banner.dto'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

export const bannerRequests = {
  banners(type: string) {
    return http.Get<Banner[] | null>(endpoints.banners, {
      params: { type },
      meta: { ignoreAuth: true, toast: false },
    }).send()
  },
}
