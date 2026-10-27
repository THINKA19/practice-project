export interface FeedbackForm {
  name: string
  mobile?: string
  content: string
  /** 本地临时文件路径 */
  files: string[]
}
