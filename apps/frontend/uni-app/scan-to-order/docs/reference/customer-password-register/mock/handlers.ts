import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { registerError } from '../models/register'
import { authBackend } from '../../login/mock'
import { fail, ok } from '@/mock/utils/response'

export default defineMock({
  [`[POST]${endpoints.demoRegister}`]: ({ data }) => {
    const body = data as { username?: unknown, password?: unknown }
    if (typeof body?.username !== 'string' || typeof body.password !== 'string' || registerError({ username: body.username, password: body.password, confirmPassword: body.password }))
      return fail('注册信息格式无效')
    return authBackend.register(body.username.trim(), body.password) ? ok(null) : fail('账号已存在')
  },
})
