/**
 * ============================================================================
 * 【文件概述】本文件负责 scripts/check-mock-output.mjs 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】无导出；校验构建报告并扫描已知 Mock 标记和路径，不能替代构建依赖检查，也不覆盖图片资源。
 * 【综合使用示例】
 * // pnpm check:mock-output dist/build/h5
 * ============================================================================
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const roots = process.argv.slice(2)
if (!roots.length)
  throw new Error('请传入生产产物目录，例如 dist/build/h5')
let checked = 0
function inspect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      inspect(file)
    }
    else if (/\.(?:js|mjs|map)$/.test(file)) {
      checked++
      const content = fs.readFileSync(file, 'utf8').replaceAll('\\', '/')
      if (/__SCAN_ORDER_DEV_MOCK__|\/src\/(?:mock\/|(?:pages(?:-shop|-rider)?|api)\/[^\s"']*\/mock\/)/.test(content))
        throw new Error(`发现 Mock 标记或源码路径: ${file}`)
    }
  }
}
for (const root of roots) {
  const output = path.resolve(root)
  const report = JSON.parse(fs.readFileSync(path.join(output, 'mock-isolation.json'), 'utf8'))
  if (report.mockEnabled !== false || !report.checkedAt)
    throw new Error(`构建报告未确认关闭 Mock: ${output}`)
  const before = checked
  inspect(output)
  if (checked === before)
    throw new Error(`产物目录没有脚本文件: ${output}`)
}
if (!checked)
  throw new Error('没有找到可检查的脚本产物')
console.log(`Mock 产物检查通过，共检查 ${checked} 个文件；配合构建插件依赖检查使用。`)
