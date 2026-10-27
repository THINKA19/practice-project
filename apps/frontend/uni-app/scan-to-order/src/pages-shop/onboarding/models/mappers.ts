import type { OnboardingUploadDto } from '../api/onboarding.dto'

/** 上传成功必须同时具备成功状态、业务码及有效文件地址。 */
export function parseOnboardingUpload(response: UniApp.UploadFileSuccessCallbackResult): { url: string } {
  const body: OnboardingUploadDto = JSON.parse(response.data)
  if (response.statusCode !== 200 || !body || ![0, 200].includes(body.code)
    || typeof body.data?.url !== 'string' || !/^https?:\/\//.test(body.data.url)) {
    throw new Error('上传失败')
  }
  return { url: body.data.url }
}
