import { http } from '@/http/alova'
import { endpoints, isAssetDemo } from './endpoints'

const demoPaths = {
  templates: endpoints.demoTemplates,
  detail: endpoints.demoDetail,
  my: endpoints.demoMy,
  statistics: endpoints.demoStatistics,
  fetch: endpoints.demoFetch,
  exchange: endpoints.demoExchange,
}
function path(key: keyof typeof demoPaths) {
  return isAssetDemo() ? demoPaths[key] : endpoints[key]
}
export const couponRequests = {
  templates(params: { page: number, pageSize: number }, headers: Record<string, string>) {
    return http.Get<unknown>(path('templates'), { params, headers, cacheFor: 0, meta: { ignoreAuth: true } }).send()
  },
  my(params: { page: number, pageSize: number, status: number | string }, headers: Record<string, string>) {
    return http.Get<unknown>(path('my'), { params, headers, cacheFor: 0, meta: { ignoreAuth: true } }).send()
  },
  detail(id: number | string) {
    return http.Get<unknown>(path('detail'), { params: { id }, cacheFor: 0 }).send()
  },
  fetch(data: { id: number | string, pwd?: string }, headers: Record<string, string>) {
    return http.Post(path('fetch'), data, { headers, meta: { ignoreAuth: true, toast: false } }).send()
  },
  exchange(number: string, pwd: string, extJsonStr = '', headers: Record<string, string>) {
    return http.Post(path('exchange'), { number, pwd, extJsonStr }, { headers, meta: { ignoreAuth: true } }).send()
  },
  statistics(headers: Record<string, string>) {
    return http.Get(path('statistics'), { headers, cacheFor: 0, meta: { ignoreAuth: true } }).send()
  },
}
