import type { WechatChannelDto as WechatChannel, WechatExchangeDto as WechatExchange, WechatPollDto as WechatPoll, WechatTicketDto as WechatTicket } from './login.dto'
import type { IAuthLoginRes } from '@/pages/auth/session'
import { http } from '@/http/alova'
import { USE_MOCK } from '@/mock/config'
import { endpoints } from './endpoints'

const config = { meta: { ignoreAuth: true, toast: false }, cacheFor: 0 }

export const loginApi = {
  demo: USE_MOCK,
  start: (channel: WechatChannel, agreementVersion: string) => http.Post<WechatTicket>(USE_MOCK ? endpoints.demoStart : endpoints.start, { channel, agreementVersion }, config),
  status: (ticket: WechatTicket) => http.Get<WechatPoll>(USE_MOCK ? endpoints.demoStatus : endpoints.status, { ...config, params: { ticket: ticket.id, pollToken: ticket.pollToken } }),
  confirmDemo: (ticket: WechatTicket) => {
    if (!USE_MOCK)
      return Promise.reject(new Error('模拟确认仅开发环境可用'))

    return http.Post<void>(endpoints.demoConfirm, { ticket: ticket.id, pollToken: ticket.pollToken }, config)
  },
  exchange: (payload: WechatExchange) => http.Post<IAuthLoginRes>(USE_MOCK ? endpoints.demoExchange : endpoints.exchange, payload, config),
}
