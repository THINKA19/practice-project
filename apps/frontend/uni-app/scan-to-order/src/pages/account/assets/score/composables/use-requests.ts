import { scoreRequests } from '../api/score.api'
import { assetHeaders } from './use-context'
import { parsePagedResponse } from '@/utils/project/paged-response'
import type { ScoreLog } from '../models/types'

/** 积分流水业务门面：复用资产分页转换，不将异常响应伪装为空列表。 */
export const scoreApi = {
  async scoreLogs(params: { page: number, pageSize: number }) {
    const data = await scoreRequests.scoreLogs(params, assetHeaders())
    return parsePagedResponse(data, (row) => {
      if (!Number.isSafeInteger(row.id) || typeof row.score !== 'number' || !Number.isFinite(row.score) || typeof row.dateAdd !== 'string')
        throw new Error('积分记录格式错误')
      return row as unknown as ScoreLog
    })
  },
}
