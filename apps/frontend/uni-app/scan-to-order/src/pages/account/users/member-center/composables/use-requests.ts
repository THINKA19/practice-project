import { levelRequests } from '../api/level.api'
import type { UserLevel } from '../models/types'
import { isAssetDemo } from '@/pages/account/assets/asset'

/** 会员等级读取门面：当前只接开发样本，正式服务未接入时返回空配置。 */
export const levelApi = {
  get available() { return isAssetDemo() },
  /** 真实等级接口的网关及折扣单位尚未确认，仅请求开发样本。 */
  async levels(): Promise<UserLevel[]> {
    if (!levelApi.available)
      return []
    return levelRequests.levels()
  },
}
