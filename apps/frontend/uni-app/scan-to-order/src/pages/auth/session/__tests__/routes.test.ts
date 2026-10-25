import fs from 'node:fs'
import { parseJson } from '@dcloudio/uni-cli-shared'
import { expect, it } from 'vitest'
import { AUTH_ROUTES, identityForPath } from '@/pages/auth/session/routes'

it('登录身份按完整分包路径识别，支持相对路径和查询参数', () => {
  expect(identityForPath('/pages-shop/business/goods/index?id=1')).toBe('shop')
  expect(identityForPath('pages-rider/task/index')).toBe('rider')
  expect(identityForPath('/pages/home/index/index')).toBe('customer')
  expect(identityForPath('/pages-shop-other/index')).toBe('customer')
  expect(identityForPath('/pages/home/index?redirect=/pages-rider/task/index')).toBe('customer')
  expect(identityForPath('')).toBe('customer')
})

it('三端登录路径均已登记，商家与骑手为普通分包', () => {
  const pages = parseJson(fs.readFileSync('src/pages.json', 'utf8'), true, 'pages.json')

  const paths = pages.pages.map((page: { path: string }) => `/${page.path}`)

  for (const sub of pages.subPackages ?? []) {
    for (const page of sub.pages) paths.push(`/${sub.root}/${page.path}`)
  }
  for (const route of Object.values(AUTH_ROUTES)) expect(paths).toContain(route)

  for (const root of ['pages-shop', 'pages-rider']) {
    const sub = pages.subPackages.find((item: { root: string }) => item.root === root)
    expect(sub).toBeTruthy()
    expect(sub.independent).not.toBe(true)
  }
  expect(new Set(paths).size).toBe(paths.length)
})
