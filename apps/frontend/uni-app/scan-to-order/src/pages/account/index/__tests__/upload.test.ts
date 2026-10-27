import { beforeEach, expect, it, vi } from 'vitest'
import { uploadAttachment } from '../composables/use-attachment-actions'
import { parseUploadedAttachment } from '../models/mappers'
import { http } from '@/http/alova'

vi.mock('@/http/alova', () => ({ http: { Post: vi.fn() }, API_DOMAINS: { SECONDARY: 'https://upload.test' } }))
vi.mock('@/pages/auth/session', () => ({ getAuthorizationHeaders: () => ({ Authorization: 'Bearer customer-token' }) }))
beforeEach(() => vi.clearAllMocks())

it('沿既有上传模式发送附件，保留字段、网关及凭证', async () => {
  vi.mocked(http.Post).mockReturnValue({ send: async () => ({ statusCode: 200, data: JSON.stringify({ code: 0, data: { url: 'https://files.test/a.jpg' } }) }) } as never)
  expect(await uploadAttachment('/tmp/a.jpg')).toBe('https://files.test/a.jpg')
  expect(http.Post).toHaveBeenCalledWith('/upload', { filePath: '/tmp/a.jpg', name: 'file' }, expect.objectContaining({ requestType: 'upload', headers: { Authorization: 'Bearer customer-token' }, meta: { ignoreAuth: true, domain: 'https://upload.test' } }))
})

it('hTTP 失败或上传结果未确认时不能作为有效附件继续提交', async () => {
  vi.mocked(http.Post).mockReturnValue({ send: async () => ({ statusCode: 500, data: '{}' }) } as never)
  await expect(uploadAttachment('/tmp/a.jpg')).rejects.toThrow('附件上传失败')
  expect(() => parseUploadedAttachment(JSON.stringify({ code: 500, data: { url: 'https://files.test/a.jpg' } }))).toThrow('附件上传未确认')
  expect(() => parseUploadedAttachment(JSON.stringify({ code: 0, data: { url: '/tmp/a.jpg' } }))).toThrow('附件地址无效')
  expect(() => parseUploadedAttachment('invalid')).toThrow()
})
