/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/auth/login/mock/handlers.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】默认导出本文件的登记规则或局部能力。
 * 【综合使用示例】
 * import mock from '@/pages/auth/login/mock/handlers'
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { wechatState } from './state'
import { fail, ok } from '@/mock/response'

export default defineMock({
  [`[POST]${endpoints.demoStart}`]: ({ data }) => {
    const body = data as {
      channel?: string
      agreementVersion?: string
    }

    if (!body || !['mini', 'wechat-h5', 'web'].includes(body.channel ?? ''))
      return fail('登录渠道无效')

    const ticket = wechatState.start(body.channel as 'mini' | 'wechat-h5' | 'web', String(body.agreementVersion))

    return ticket ? ok(ticket) : fail('请阅读最新协议')
  },
  [`[GET]${endpoints.demoStatus}`]: ({ query }) => ok({ status: wechatState.status(String(query.ticket), String(query.pollToken)) }),
  [`[POST]${endpoints.demoConfirm}`]: ({ data }) => {
    const body = data as {
      ticket?: string
      pollToken?: string
    }

    return body && wechatState.confirm(String(body.ticket), String(body.pollToken)) ? ok(null) : fail('二维码已失效或状态不正确')
  },
  [`[POST]${endpoints.demoExchange}`]: ({ data }) => {
    const body = data as {
      ticket?: string
      pollToken?: string
      agreementVersion?: string
    }

    const result = body && wechatState.exchange(String(body.ticket), String(body.pollToken), String(body.agreementVersion), import.meta.env.VITE_AUTH_MODE === 'double')

    return result ? ok(result) : fail('请先完成模拟微信确认，或重新获取二维码')
  },
})
