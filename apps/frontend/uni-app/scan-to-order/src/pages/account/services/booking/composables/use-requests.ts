import { bookingRequests } from '../api/booking.api'
import { isAccepted } from '../models/mappers'

/** 订座业务门面：响应必须明确 accepted=true，缺失确认不能按提交成功处理。 */
export const bookingApi = {
  info: bookingRequests.info,
  async join(data: { yuyueId: string, extJsonStr: string }): Promise<{ accepted: true }> {
    const result = await bookingRequests.join(data)
    if (!isAccepted(result))
      throw new Error('预约结果未确认')
    return result
  },
}
