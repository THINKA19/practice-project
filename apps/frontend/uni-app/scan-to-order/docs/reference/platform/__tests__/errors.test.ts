// 历史参考资料：禁止正式业务导入；按需提取到正式模块后再接入和验证。
import { describe, expect, it } from 'vitest'
import { platformError } from '../errors'

describe('平台错误契约', () => {
  it.each([['requestPayment:fail cancel', 'Cancelled'], ['getLocation:fail auth deny', 'Denied'], ['not supported', 'Unsupported'], ['system unavailable', 'System']])('%s 分类为 %s', (errMsg, reason) => {
    const original = { errMsg }
    const error = platformError(original)
    expect(error.reason).toBe(reason)
    expect(error.original).toBe(original)
    expect(platformError(error)).toBe(error)
  })
  it('保留隐私授权语义', () => {
    expect(platformError({ errMsg: 'fail privacy permission is not authorized' })).toMatchObject({ reason: 'Denied', detail: 'privacy' })
  })
})
