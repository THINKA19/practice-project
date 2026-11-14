import fs from 'node:fs'
import { initPreContext, parseJson } from '@dcloudio/uni-cli-shared'
import { expect, it } from 'vitest'
import { AUTH_ROUTES, identityForPath } from '@/pages/auth/session/routes'
import { ShopRoutes } from '@/pages-shop/routes'

it('登录身份按完整分包路径识别，支持相对路径和查询参数', () => {
  expect(identityForPath('/pages-shop/goods/index/index?id=1')).toBe('shop')
  expect(identityForPath('pages-rider/task/index')).toBe('rider')
  expect(identityForPath('/pages/home/index/index')).toBe('customer')
  expect(identityForPath('/pages-shop-other/index')).toBe('customer')
  expect(identityForPath('/pages/home/index?redirect=/pages-rider/task/index')).toBe('customer')
  expect(identityForPath('')).toBe('customer')
})

it.each(['h5', 'mp-weixin'])('%s 登录和商家管理路由均已登记，商家与骑手为普通分包', (platform) => {
  initPreContext(platform)
  const pages = parseJson(fs.readFileSync('src/pages.json', 'utf8'), true, 'pages.json')

  const paths = pages.pages.map((page: { path: string }) => `/${page.path}`)

  for (const sub of pages.subPackages ?? []) {
    for (const page of sub.pages) paths.push(`/${sub.root}/${page.path}`)
  }
  for (const route of Object.values(AUTH_ROUTES)) expect(paths).toContain(route)
  for (const group of Object.values(ShopRoutes)) {
    for (const route of Object.values(group))
      expect(paths).toContain(route)
  }

  for (const root of ['pages-shop', 'pages-rider']) {
    const sub = pages.subPackages.find((item: { root: string }) => item.root === root)
    expect(sub).toBeTruthy()
    expect(sub.independent).not.toBe(true)
  }
  expect(new Set(paths).size).toBe(paths.length)
})
