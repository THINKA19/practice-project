import { cmsRequests } from '../api/cms.api'
import { parseCmsPage } from '../models/mappers'

/** 正文业务门面：将原始内容转换为已校验的页面模型，保留空内容与请求失败的区别。 */
export const cmsApi = {
  cmsPage: async (key: string) => parseCmsPage(await cmsRequests.cmsPage(key)),
}
