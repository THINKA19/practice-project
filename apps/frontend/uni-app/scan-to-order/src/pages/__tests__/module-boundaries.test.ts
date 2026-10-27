import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { expect, it } from 'vitest'

const src = path.resolve('src')
function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? files(file) : [file]
  })
}
const all = ['pages', 'pages-shop', 'pages-rider'].flatMap(dir => files(path.join(src, dir)))
const modules = all.filter(file => path.basename(file) === 'index.ts'
  && !/\/(?:api|models|mock|components|parts|composables)\//.test(file.replaceAll('\\', '/'))).map(file => path.dirname(file))
const owner = (file: string) => modules.filter(dir => file.startsWith(`${dir}${path.sep}`)).sort((a, b) => b.length - a.length)[0]

function imports(file: string) {
  const content = fs.readFileSync(file, 'utf8')
  const script = file.endsWith('.vue') ? content.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] || '' : content
  return ts.createSourceFile(file, script, ts.ScriptTarget.Latest, true).statements.filter(ts.isImportDeclaration)
}

it('请求 API 不依赖页面组合函数、组件或业务转换函数', () => {
  const violations: string[] = []
  for (const file of all.filter(file => /[/\\]api[/\\].*\.api\.ts$/.test(file))) {
    for (const statement of imports(file)) {
      const spec = (statement.moduleSpecifier as ts.StringLiteral).text
      if (/\/(?:composables|components|mappers)(?:\/|$)/.test(spec))
        violations.push(`${path.relative(src, file)} -> ${spec}`)
    }
  }
  expect(violations).toEqual([])
})

it('模型与纯规则不依赖 Vue、Pinia、HTTP 或上层页面运行时代码', () => {
  const violations: string[] = []
  for (const file of all.filter(file => /[/\\](?:models|domain)[/\\].*\.ts$/.test(file))) {
    for (const statement of imports(file)) {
      if (statement.importClause?.isTypeOnly)
        continue
      const spec = (statement.moduleSpecifier as ts.StringLiteral).text
      if (/^(?:vue|pinia|@dcloudio\/uni-app)$/.test(spec) || /\/(?:api|http|composables|components)(?:\/|$)/.test(spec))
        violations.push(`${path.relative(src, file)} -> ${spec}`)
    }
  }
  expect(violations).toEqual([])
})

it('跨领域运行时与类型引用通过所属模块的 index.ts', () => {
  const violations: string[] = []
  for (const file of all.filter(file => /\.(?:ts|vue)$/.test(file) && !/[/\\](?:__tests__|mock)[/\\]/.test(file))) {
    for (const statement of imports(file)) {
      const spec = (statement.moduleSpecifier as ts.StringLiteral).text
      const base = spec.startsWith('@/') ? path.resolve(src, spec.slice(2)) : spec.startsWith('.') ? path.resolve(path.dirname(file), spec) : ''
      if (!base)
        continue
      const target = [base, `${base}.ts`, `${base}.vue`, path.join(base, 'index.ts')].find(file => fs.existsSync(file) && fs.statSync(file).isFile())
      if (target && owner(target) && owner(target) !== owner(file) && path.basename(target) !== 'index.ts')
        violations.push(`${path.relative(src, file)} -> ${spec}`)
    }
  }
  expect(violations).toEqual([])
})
