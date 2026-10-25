import { describe, expect, it } from 'vitest'
import { buildFeedbackExt } from '@/pages/account/index'

describe('system.buildFeedbackExt', () => {
  it('保留姓名/电话并跳过上传失败的附件下标', () => {
    expect(buildFeedbackExt('张三', undefined, ['a.png', '', 'c.png'])).toEqual({
      姓名: '张三',
      联系电话: '',
      file0: 'a.png',
      file2: 'c.png',
    })
  })
})
