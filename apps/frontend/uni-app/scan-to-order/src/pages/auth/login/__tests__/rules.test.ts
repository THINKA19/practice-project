import { expect, it } from 'vitest'
import { resolveRedirect } from '../domain/redirect.rules'
import { createWechatState } from '@/pages/auth/login/mock'
import { AGREEMENT_VERSION } from '../../agreement'

const home = '/pages/home/index/index'

it('rejects external, unknown, role-specific and looping login redirects', () => {
  const paths = [home, '/pages/pickup/index/index', '/pages/auth/login/index']

  expect(resolveRedirect(encodeURIComponent('/pages/pickup/index/index?mode=one'), paths, home)).toBe('/pages/pickup/index/index?mode=one')

  for (const value of ['https://example.com', '//example.com', '/pages/auth/login/index', '/pages-shop/auth/login/index', '/pages/missing', '%E0%A4%A', undefined])
    expect(resolveRedirect(value, paths, home)).toBe(home)
})

it('expires QR tickets and rejects wrong polling secrets, replay and outdated agreements', () => {
  let now = 1000

  const b = createWechatState(() => now)

  expect(b.start('web', 'old')).toBeNull()

  const ticket = b.start('web', AGREEMENT_VERSION)!

  expect(b.confirm(ticket.id, 'wrong')).toBe(false)

  expect(b.exchange(ticket.id, ticket.pollToken, AGREEMENT_VERSION, false)).toBeNull()

  now = ticket.expiresAt

  expect(b.confirm(ticket.id, ticket.pollToken)).toBe(false)

  expect(b.status(ticket.id, ticket.pollToken)).toBe('expired')
})

it('maps mobile and PC confirmation to one simulated customer without passwords', () => {
  const b = createWechatState()

  const identities = ['mini', 'web'].map((channel) => {
    const ticket = b.start(channel as 'mini' | 'web', AGREEMENT_VERSION)!

    b.confirm(ticket.id, ticket.pollToken)

    const result = b.exchange(ticket.id, ticket.pollToken, AGREEMENT_VERSION, false)!

    expect(b.exchange(ticket.id, ticket.pollToken, AGREEMENT_VERSION, false)).toBeNull()

    return b.profile('token' in result ? result.token : result.accessToken)?.userId
  })

  expect(identities).toEqual([10001, 10001])
})

it('uses one customer owner across newly issued WeChat sessions', async () => {
  const { wechatState } = await import('@/pages/auth/login/mock')

  const { mockCustomerOwner } = await import('@/pages/auth/session/mock')

  const owners = ['mini', 'web'].map((channel) => {
    const ticket = wechatState.start(channel as 'mini' | 'web', AGREEMENT_VERSION)!

    wechatState.confirm(ticket.id, ticket.pollToken)

    const result = wechatState.exchange(ticket.id, ticket.pollToken, AGREEMENT_VERSION, false)!

    return mockCustomerOwner(`Bearer ${'token' in result ? result.token : result.accessToken}`)
  })

  expect(owners).toEqual(['customer:10001', 'customer:10001'])
})
