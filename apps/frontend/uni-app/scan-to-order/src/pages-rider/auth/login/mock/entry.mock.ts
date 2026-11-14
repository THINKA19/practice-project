/**
 * ============================================================================
 * 【文件概述】骑手登录的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - default：Alova MockWrapper；路径引用本模块 endpoints。
 * 【综合使用示例】
 * import entry from '@/pages-rider/auth/login/mock/entry.mock'
 * Object.keys(entry.data) // 测试中检查本模块登记路径
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { ok } from '@/mock/response'
import { endpoints } from '../api/endpoints'
import { login } from './state'
import type { LoginCredentialsDto } from '../api/login.dto'

export default defineMock({
  [`[POST]${endpoints.login}`]: async ({ data }) => {
    const body = data as LoginCredentialsDto
    if (!body || typeof body.username !== 'string' || typeof body.password !== 'string')
      throw new Error('登录参数不合法')
    return ok(await login(body.username, body.password))
  },
})
