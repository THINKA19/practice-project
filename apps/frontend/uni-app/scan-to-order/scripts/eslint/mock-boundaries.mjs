/**
 * ============================================================================
 * 【文件概述】本文件负责 scripts/eslint/mock-boundaries.mjs 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】默认导出本文件的登记规则或局部能力。
 * 【综合使用示例】
 * // pnpm exec eslint src/mock
 * ============================================================================
 */
import path from 'node:path'

/** ESLint 本地边界规则；不加载任何业务 Mock。 */
export default {
  rules: {
    boundaries: {
      meta: { type: 'problem', schema: [], messages: { boundary: '{{reason}}' } },
      create(context) {
        const file = path.resolve(context.filename).replaceAll('\\', '/')
        const test = /\/(?:__tests__|test-setup)\//.test(file) || /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file) || file.endsWith('/src/test-setup.ts')
        const ownMock = file.includes('/mock/') ? file.slice(0, file.lastIndexOf('/mock/') + 6) : null
        const report = (node, reason) => context.report({ node, messageId: 'boundary', data: { reason } })
        function check(node, source) {
          if (typeof source !== 'string' || test || (!source.startsWith('@/') && !source.startsWith('.')))
            return
          const target = source.startsWith('@/') ? path.resolve(context.cwd, 'src', source.slice(2)) : path.resolve(path.dirname(file), source)
          const normalized = target.replaceAll('\\', '/').replace(/\.ts$/, '')
          const marker = normalized.lastIndexOf('/mock')
          if (marker < 0 || !/^(?:\/|$)/.test(normalized.slice(marker + 5)))
            return
          const publicMock = /\/src\/mock(?:\/|$)/.test(normalized)
          if (!ownMock) {
            // Existing application mode flags are an explicit exception; they load no business data.
            if (publicMock && normalized.endsWith('/config') && ['/src/main.ts', '/src/http/alova.ts', '/src/pages/auth/session/api/session.ts', '/src/pages-shop/auth/login/api/login.ts', '/src/pages-rider/auth/login/api/login.ts', '/src/pages/auth/login/api/login.ts', '/src/pages/auth/login/composables/useLogin.ts', '/src/pages/account/index/composables/useAccountSession.ts'].some(allowed => file.endsWith(allowed)))
              return
            if (['/src/http/alova.ts', '/src/main.ts'].some(allowed => file.endsWith(allowed)) && /\/src\/mock(?:\/index)?$/.test(normalized))
              return
            // 分包登录 API 的本地开发接缝；主包不加载分包 Mock。
            if (['shop', 'rider'].some(role => file.endsWith(`/src/pages-${role}/auth/login/api/login.ts`) && normalized.endsWith(`/src/pages-${role}/auth/login/mock`)))
              return
            report(node, '普通业务代码不得引用 Mock；通过业务 API 发起请求')
          }
          else if (!publicMock && !normalized.startsWith(ownMock) && !/\/mock(?:\/index(?:\.ts)?)?$/.test(normalized)) {
            report(node, '跨模块 Mock 只能引用对方 mock/index.ts')
          }
          if (/\/mock\/index\.ts$/.test(file) && /\/(?:handlers|entry\.mock)(?:\.ts)?$/.test(normalized))
            report(node, 'mock/index.ts 不得导出或加载 handler 和登记入口')
        }
        return {
          ImportDeclaration: (node) => {
            check(node, node.source.value)
            if (ownMock && !test && node.specifiers.some(specifier => specifier.imported?.name === 'endpoints')) {
              const source = node.source.value
              const target = source.startsWith('@/') ? path.resolve(context.cwd, 'src', source.slice(2)) : path.resolve(path.dirname(file), source)
              const owner = ownMock.slice(0, -6)
              if (![`${owner}/api/endpoints`, `${owner}/endpoints`].includes(target.replaceAll('\\', '/').replace(/\.ts$/, '')))
                report(node, 'Mock 路径只能引用所属模块 endpoints')
            }
          },
          Property: (node) => {
            if (!ownMock || test || node.parent?.parent?.callee?.name !== 'defineMock')
              return
            if (!node.computed || node.key.type !== 'TemplateLiteral' || node.key.expressions.length !== 1 || !node.key.expressions.every(expression => expression.type === 'MemberExpression' && expression.object.name === 'endpoints'))
              report(node, 'Mock 路由通过模板引用所属 endpoints 常量')
          },
          ExportNamedDeclaration: (node) => {
            if (node.source)
              check(node, node.source.value)
          },
          ExportAllDeclaration: node => check(node, node.source.value),
          ImportExpression: node => check(node, node.source.value),
        }
      },
    },
  },
}
