/**
 * 【文件概述】只登记会话模块所属的模拟生命周期接口。
 * 【方法与导出清单】default
 * 【综合使用示例】通过本模块 index.ts 调用公开能力。
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { sessionState } from './state'
import { fail, ok } from '@/mock/response'

const token = (headers: Record<string, unknown>) => String(headers.Authorization ?? '').replace(/^Bearer /, '')

export default defineMock({
  [`[GET]${endpoints.demoProfile}`]: ({ headers }) => {
    const user = sessionState.profile(token(headers))
    return user ? ok(user) : fail('登录凭证无效', 401)
  },
  [`[POST]${endpoints.demoRefresh}`]: ({ data }) => {
    const result = sessionState.refresh(String((data as {
      refreshToken?: string
    })?.refreshToken))
    return result ? ok(result) : fail('刷新凭证无效', 401)
  },
  [`[POST]${endpoints.demoLogout}`]: ({ headers }) => {
    sessionState.logout(token(headers))
    return ok(null)
  },
})
