import { onboardingRequests } from '../api/join-apply.api'
import { parseOnboardingUpload } from '../models/mappers'

/** 入驻请求业务门面：校验上传状态及服务端文件地址，再供提交流程使用。 */
export const joinApplyApi = {
  addComment: onboardingRequests.addComment,
  uploadFile: async (filePath: string) => parseOnboardingUpload(await onboardingRequests.uploadFile(filePath)),
}
