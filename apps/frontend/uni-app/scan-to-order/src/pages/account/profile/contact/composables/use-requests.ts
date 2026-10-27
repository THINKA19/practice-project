import { contactRequests } from '../api/contact.api'
import { parseServiceConfig } from '../models/mappers'
/** 源码约定的公开客服配置接口，真实部署需后端确认。 */
export const contactApi = {
  async config() {
    return parseServiceConfig(await contactRequests.config())
  },
}
