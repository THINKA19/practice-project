import fs from 'node:fs'
import path from 'node:path'
import { expect, it } from 'vitest'

const roots = ['src/pages', 'src/pages-rider', 'src/pages-shop'].map(dir => path.resolve(dir))
function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? files(file) : [file]
  })
}

it('所有局部组件统一使用独立目录的 index.vue，页面不进入组件目录', () => {
  const components = roots.flatMap(files).filter(file => file.endsWith('.vue') && file.split(path.sep).includes('components'))
  expect(components.length).toBeGreaterThan(0)
  for (const file of components) {
    expect(path.basename(file), file).toBe('index.vue')
    expect(path.basename(path.dirname(file)), file).not.toBe('components')
    expect(fs.readFileSync(file, 'utf8'), file).not.toMatch(/\bdefinePage\s*\(/)
  }
})

it('私有子部件使用 parts，业务组件不再嵌套 components 目录', () => {
  const nested = roots.flatMap(files).filter(file => file.split(path.sep).filter(part => part === 'components').length > 1)
  expect(nested).toEqual([])
})
