import { http } from '@/http/http'
import { permissionEndpoint } from './endpoints'

export const merchantGrantRequests = {
  shops: (token: string) => http.get<unknown>(permissionEndpoint('SHOPS'), undefined, { Authorization: `Bearer ${token}` }),
  grant: (token: string, shopId: string) => http.get<unknown>(permissionEndpoint('GRANT'), { shopId }, { Authorization: `Bearer ${token}` }),
}
