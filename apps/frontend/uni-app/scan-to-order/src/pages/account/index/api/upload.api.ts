import { API_DOMAINS, http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import { endpoints } from './endpoints'

export const attachmentRequests = {
  upload: (filePath: string) => http.Post<UniApp.UploadFileSuccessCallbackResult>(endpoints.upload, { filePath, name: 'file' }, {
    requestType: 'upload',
    headers: getAuthorizationHeaders('customer'),
    meta: { ignoreAuth: true, domain: API_DOMAINS.SECONDARY },
  }).send(),
}
