/** 演示资产摘要，金额单位为分，计数为非负安全整数。 */
export interface Assets {
  couponCount: number
  balanceCents: number
  points: number
  demo: true
}

/** 账户附件上传响应中的文件信息。 */
export interface UploadedAttachment {
  url: string
}

export interface CustomerProfileForm {
  gender: 'unknown' | 'male' | 'female'
  birthday: string
}
