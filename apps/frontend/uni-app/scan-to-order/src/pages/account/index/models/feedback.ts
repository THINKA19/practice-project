/** 意见反馈留言类型（原 feedback addComment type=1） */
export const FEEDBACK_COMMENT_TYPE = 1

export interface FeedbackForm {
  name: string
  mobile?: string
  content: string
  /** 本地临时文件路径 */
  files: string[]
}

/**
 * 反馈扩展字段（原 extJsonStr 结构：姓名、联系电话、file{index}）
 * fileUrls 中空串表示该附件上传失败，跳过但保留原下标
 */
export function buildFeedbackExt(name: string, mobile: string | undefined, fileUrls: string[]): Record<string, string> {
  const ext: Record<string, string> = {
    姓名: name,
    联系电话: mobile || '',
  }
  fileUrls.forEach((url, index) => {
    if (url) {
      ext[`file${index}`] = url
    }
  })
  return ext
}
