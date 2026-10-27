/**
 * 【文件概述】会话所有权与小程序分包依赖约束。
 * 【方法与导出清单】default，ESLint 本地插件。
 * 【综合使用示例】由 eslint.config.mjs 注册。
 */
import path from 'node:path'

export default { rules: { boundaries: {
  meta: { type: 'problem', schema: [], messages: { boundary: '{{reason}}' } },
  create(context) {
    const file = context.filename.replaceAll('\\', '/')
    if (/\/__tests__\//.test(file) || /\.(?:test|spec)\.ts$/.test(file))
      return {}
    function check(node, source) {
      if (typeof source !== 'string' || (!source.startsWith('@/') && !source.startsWith('.')))
        return
      const target = (source.startsWith('@/') ? path.resolve(context.cwd, 'src', source.slice(2)) : path.resolve(path.dirname(file), source)).replaceAll('\\', '/').replace(/\.ts$/, '')
      const inSession = file.includes('/src/pages/auth/session/')
      if (!inSession && /\/src\/pages\/auth\/session\/(?!mock(?:\/|$)|index$|routes\/index$)/.test(target))
        context.report({ node, messageId: 'boundary', data: { reason: '会话内部实现只能由本模块引用，消费者使用 session/index.ts；静态路径使用 routes/index.ts' } })
      const owner = /\/src\/(pages-shop|pages-rider)\//.exec(file)?.[1]
      const dependency = /\/src\/(pages-shop|pages-rider)\//.exec(target)?.[1]
      if (dependency && owner !== dependency)
        context.report({ node, messageId: 'boundary', data: { reason: '主包不得依赖分包，普通分包不得互相依赖' } })
    }
    return { ImportDeclaration: node => check(node, node.source.value), ExportNamedDeclaration: node => node.source && check(node, node.source.value), ExportAllDeclaration: node => check(node, node.source.value), ImportExpression: node => check(node, node.source.value) }
  },
} } }
