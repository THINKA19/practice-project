import type { UserLevelDto as UserLevel } from './level.dto'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

export const levelRequests = {
  levels() {
    return http.Get<UserLevel[]>(endpoints.demoLevels, { cacheFor: 0, meta: { ignoreAuth: true } }).send()
  },
}
