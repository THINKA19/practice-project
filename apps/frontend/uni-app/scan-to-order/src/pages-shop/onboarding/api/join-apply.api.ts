import type { OnboardingSubmissionDto } from './onboarding.dto'
import { http } from '@/http/http'
import { http as alova } from '@/http/alova'
import { getToken } from '@/pages/auth/session'
import { onboardingEndpoint } from './endpoints'

export const onboardingRequests = {
  addComment: (data: OnboardingSubmissionDto) => http.post(onboardingEndpoint('VITE_SHOP_ONBOARDING_URL'), data),
  uploadFile: (filePath: string) => alova.Post<UniApp.UploadFileSuccessCallbackResult>(onboardingEndpoint('VITE_SHOP_ONBOARDING_UPLOAD_URL'), { filePath, name: 'file' }, {
    requestType: 'upload',
    headers: { Authorization: `Bearer ${getToken()}` },
    meta: { ignoreAuth: true },
  }).send(),
}
