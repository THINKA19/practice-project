import type { RegisterForm } from '../models/register'
import { http } from '@/http/alova'
import { http as request } from '@/http/http'
import { USE_MOCK } from '@/mock/config'
import { endpoints } from './endpoints'

export const registerApi = {
  register: (form: RegisterForm) => {
    const payload = { username: form.username.trim(), password: form.password }
    return USE_MOCK ? http.Post<void>(endpoints.demoRegister, payload, { meta: { ignoreAuth: true, toast: false } }) : request.post<void>(endpoints.register, payload)
  },
}
