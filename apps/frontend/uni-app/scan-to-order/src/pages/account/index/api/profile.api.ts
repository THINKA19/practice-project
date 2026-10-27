import type { CustomerProfileDto } from './profile.dto'
import { http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import { endpoints } from './endpoints'

const profilePath = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true' ? endpoints.demoProfile : endpoints.profile
const config = () => ({ headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } })
export const profileRequests = {
  read: () => http.Get<unknown>(profilePath, config()).send(),
  save: (form: CustomerProfileDto) => http.Post<unknown>(profilePath, form, config()).send(),
}
