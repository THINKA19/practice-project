import { expect, it } from 'vitest'
import { decideRouteAccess } from '../roleAccess'

it('角色路由不允许跨端登录页，游客仅可访问对应登录页', () => {
  expect(decideRouteAccess('/pages-shop/access/auth/login', 'customer', true)).toBe(false)
  expect(decideRouteAccess('/pages-rider/access/auth/login', 'shop', true)).toBe(false)
  expect(decideRouteAccess('/pages/home/index/index', 'rider', true)).toBe(false)
  expect(decideRouteAccess('/pages-shop/access/auth/login', null, false)).toBe(true)
  expect(decideRouteAccess('/pages-shop/operations/order/index', null, false)).toBe(false)
  expect(decideRouteAccess('/pages-shop/operations/order/index', 'shop', true)).toBe(true)
})
