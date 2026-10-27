/** 反馈开发 Mock；不持久化姓名、手机号及附件，不进行真实文件上传。 */
import { defineMock } from '@alova/mock'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { endpoints } from '../api/endpoints'
import { FEEDBACK_COMMENT_TYPE } from '../models/enums'

function isCustomer(authorization: unknown) {
  try {
    if (!/^Bearer wx-demo-session-\S+$/.test(String(authorization ?? '')))
      return false
    mockCustomerOwner(authorization)
    return true
  }
  catch { return false }
}

export default defineMock({
  [`[POST]${endpoints.addComment}`]: withFailure(({ headers, data }) => {
    if (!isCustomer(headers.Authorization))
      return fail('请先登录顾客账户', 401)
    if (data.type !== FEEDBACK_COMMENT_TYPE || typeof data.content !== 'string' || !data.content.trim())
      return fail('请填写反馈内容')
    let ext: unknown
    try {
      ext = JSON.parse(String(data.extJsonStr))
    }
    catch { return fail('反馈附件格式无效') }
    if (!ext || typeof ext !== 'object' || !('姓名' in ext) || typeof ext.姓名 !== 'string' || !ext.姓名.trim())
      return fail('请填写姓名')
    return ok({ submitted: true, demo: true })
  }, { write: true }),
})
