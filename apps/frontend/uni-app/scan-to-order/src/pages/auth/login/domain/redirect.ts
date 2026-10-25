/**
 * 【文件概述】顾客登录后的纯跳转校验规则，拒绝未知页面、外链和登录回环。
 * 【方法与导出清单】resolveRedirect。
 * 【综合使用示例】resolveRedirect(query.redirect, registeredPaths, homePath)
 */
/** URL 只允许已注册的客户端页面；拒绝登录回环与其他身份端。 */
export function resolveRedirect(value: unknown, paths: readonly string[], fallback: string): string {
  if (typeof value !== 'string')
    return fallback

  let target = value

  try {
    if (!target.startsWith('/'))
      target = decodeURIComponent(target)
  }
  catch {
    return fallback
  }
  const path = target.split('?')[0]

  return target.startsWith('/pages/') && !path.startsWith('/pages/auth/') && !/[\\#\r\n]/.test(target) && paths.includes(path) ? target : fallback
}
