import { signRequests } from '../api/sign.api'
/** 签到接口，认证来自唯一会话。 */
import { parseSignLogs } from '../models/mappers'
import type { SignLog } from '../models/types'

/** 签到业务门面：校验签到记录，提交结果缺失时拒绝确认成功。 */
export const signApi = {
  async sign() {
    const data = await signRequests.sign()
    if (data === undefined)
      throw new Error('签到请求未完成')
    return data
  },
  async signLogs(): Promise<SignLog[]> {
    const data = await signRequests.signLogs()
    return parseSignLogs(data)
  },
}
