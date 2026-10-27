import { describe, expect, it } from 'vitest'
import { parseOnboardingUpload } from '../models/mappers'

const response = (body: unknown, statusCode = 200) => ({ statusCode, data: JSON.stringify(body), errMsg: 'uploadFile:ok' })
describe('入驻附件上传边界', () => {
  it('只接受服务端确认的 HTTP(S) 地址', () => {
    expect(parseOnboardingUpload(response({ code: 0, data: { url: 'https://files.test/shop.jpg' } }))).toEqual({ url: 'https://files.test/shop.jpg' })
    for (const body of [null, {}, { code: 401 }, { code: 0, data: { url: '/tmp/local.jpg' } }])
      expect(() => parseOnboardingUpload(response(body))).toThrow()
    expect(() => parseOnboardingUpload(response({ code: 0, data: { url: 'https://files.test/shop.jpg' } }, 500))).toThrow('上传失败')
  })
})
