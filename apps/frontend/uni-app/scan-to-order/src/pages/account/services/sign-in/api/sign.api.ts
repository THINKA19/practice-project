import { http } from '@/http/alova'
import { getToken } from '@/pages/auth/session'
import { endpoints } from './endpoints'
import type { SignLogDto as SignLog } from './sign.dto'

export const signRequests = {
  sign() {
    return http.Post<unknown>(endpoints.sign, {}, { headers: { Authorization: `Bearer ${getToken()}` }, cacheFor: 0 }).send()
  },
  signLogs() {
    return http.Post<{ result?: SignLog[] } | null>(endpoints.signLogs, {}, { headers: { Authorization: `Bearer ${getToken()}` }, cacheFor: 0 }).send()
  },
}
