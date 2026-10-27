import { API_DOMAINS, http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import { endpoints } from './endpoints'

export const feedbackRequests = {
  submit(payload: Record<string, unknown>) {
    return http.Post<unknown>(endpoints.addComment, payload, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false, domain: API_DOMAINS.SECONDARY } }).send()
  },
}
