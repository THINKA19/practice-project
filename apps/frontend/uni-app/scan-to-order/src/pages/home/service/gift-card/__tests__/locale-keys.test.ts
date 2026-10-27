import fs from 'node:fs'
import path from 'node:path'
import { expect, it } from 'vitest'

function sources(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.name === '__tests__' ? [] : entry.isDirectory() ? sources(path.join(dir, entry.name)) : /\.(?:ts|vue)$/.test(entry.name) ? [fs.readFileSync(path.join(dir, entry.name), 'utf8')] : [])
}
it.each(['zh-Hans', 'en', 'vi'])('%s 礼品卡与售后界面所用静态文案均存在且为文字', (locale) => {
  const resource = JSON.parse(fs.readFileSync(`src/locale/${locale}.json`, 'utf8'))
  const keys = sources('src/pages/home/service/gift-card').concat(sources('src/pages/home/service/gift-send'), sources('src/pages/home/service/gift-receive')).concat(sources('src/pages/account/profile/order-refund-apply')).flatMap(source => [...source.matchAll(/\bt\('((?:card|refund)\.[^']+)'/g)].map(match => match[1]))
  keys.push(...[0, 1, 2, 3, 4, -1].map(status => `refund.status.s${status}`))
  for (const key of new Set(keys)) {
    const value = key.split('.').reduce((node, part) => node?.[part], resource)
    expect(typeof value, key).toBe('string')
    expect(value, key).not.toBe('')
  }
})
