import fs from 'node:fs'
import path from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { discoverMockModules, resetAllMocks } from '../loader'

const endpoints = import.meta.glob<{ endpoints: Record<string, string> }>([
  '/src/pages/**/api/endpoints.ts',
], { eager: true })

beforeEach(() => resetAllMocks())
describe('mock contracts', () => {
  for (const [source, entry] of Object.entries(discoverMockModules())) {
    it(source, () => {
      const owner = source.slice(0, source.indexOf('/mock/'))
      const contract = endpoints[`${owner}/api/endpoints.ts`] ?? endpoints[`${owner}/endpoints.ts`]
      expect(contract, '登记模块必须提供所属 endpoints').toBeDefined()
      const paths = Object.values(contract.endpoints)
      for (const [route, handler] of Object.entries(entry.default.data)) {
        expect(paths).toContain(route.replace(/^\[[A-Z]+\]/i, ''))
        expect(typeof handler).toBe('function')
      }
    })
  }
})

const sources = import.meta.glob<string>([
  '/src/pages/**/mock/**/*.ts',
  '!/src/**/mock/**/__tests__/**',
], { query: '?raw', import: 'default', eager: true })

it('mock 依赖不存在循环，登记路径使用所属 endpoints 常量', () => {
  const edges = new Map<string, string[]>()
  for (const [file, code] of Object.entries(sources)) {
    const implementation = code.replace(/\/\*[\s\S]*?\*\//g, '')
    const imports = Array.from(implementation.matchAll(/(?:from\s*|import\s*\()(['"])([^'"]+)\1/g)).map(match => match[2])
    const targets = imports.filter(value => value.startsWith('@/') || value.startsWith('.')).map((value) => {
      const target = value.startsWith('@/') ? `/src/${value.slice(2)}` : path.posix.resolve(path.posix.dirname(file), value)
      return [target, `${target}.ts`, `${target}/index.ts`].find(candidate => sources[candidate] !== undefined)
    }).filter((value): value is string => !!value)
    edges.set(file, targets)
    if (/\[(?:GET|POST|PUT|DELETE|PATCH)\]/.test(implementation)) {
      expect(implementation).not.toMatch(/['"]\[(?:GET|POST|PUT|DELETE|PATCH)\]\//)
      expect(implementation).toContain('endpoints.')
    }
  }
  const active = new Set<string>()
  const visited = new Set<string>()
  function visit(file: string) {
    if (active.has(file))
      throw new Error(`Mock 循环依赖: ${[...Array.from(active), file].join(' -> ')}`)
    if (visited.has(file))
      return
    active.add(file)
    for (const target of edges.get(file) ?? []) visit(target)
    active.delete(file)
    visited.add(file)
  }
  for (const file of Array.from(edges.keys())) visit(file)
  // Verify endpoint files can be read independently; no business request instance is needed.
  for (const file of Object.keys(endpoints)) expect(fs.existsSync(path.resolve(file.slice(1)))).toBe(true)
})
