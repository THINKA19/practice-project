import type { CmsPage } from './types'

/** 只接受配置正文的已知字段，接口错误不伪装成空正文。 */
export function parseCmsPage(data: unknown): CmsPage | null {
  if (data == null)
    return null
  if (typeof data !== 'object' || !('info' in data) || !data.info || typeof data.info !== 'object')
    throw new Error('内容格式无效')
  const info = data.info
  for (const field of ['title', 'content', 'contact'] as const) {
    if (field in info && typeof info[field] !== 'string')
      throw new Error('内容格式无效')
  }
  return { info: {
    title: 'title' in info ? info.title as string : undefined,
    content: 'content' in info ? info.content as string : undefined,
    contact: 'contact' in info ? info.contact as string : undefined,
  } }
}
