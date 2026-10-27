export interface OnboardingSubmissionDto {
  type: number
  content: string
  extJsonStr: string
}

export interface OnboardingUploadDto {
  code: number
  data?: { url?: unknown }
}
