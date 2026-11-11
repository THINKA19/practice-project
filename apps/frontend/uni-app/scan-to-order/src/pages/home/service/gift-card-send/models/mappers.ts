/**
 * ============================================================================
 * 【文件概述】赠送响应边界校验，拒绝空或非字符串凭证。
 * 【方法与导出清单】parseShareToken(value)。
 * 【综合使用示例】
 * import { parseShareToken } from './mappers'
 * const token = parseShareToken('example') // => 'example'
 * ============================================================================
 */
/**
 * 校验服务端分享凭证，保持不透明凭证原值。
 * @param value unknown；服务端原始响应。
 * @returns string；无效时抛出 Error，不启用分享按钮。
 * @example parseShareToken('example') // => 'example'
 */
export function parseShareToken(value: unknown): string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error('未取得有效的分享凭证')
  return value
}
