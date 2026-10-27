/** 账户附件上传：复用既有 Alova 上传适配器，不创建公共请求的替代实现。 */
import { attachmentRequests } from '../api/upload.api'
import { parseUploadedAttachment } from '../models/mappers'

/**
 * 上传反馈图片/视频或订单售后凭证；当前必须为有效顾客会话。
 * @param filePath 平台选择器提供的临时文件路径。
 * @returns 服务端确认的 HTTP(S) 文件地址，失败则抛错。
 * @example await uploadAttachment('/tmp/evidence.jpg')
 */
export async function uploadAttachment(filePath: string): Promise<string> {
  const response = await attachmentRequests.upload(filePath)
  if (response.statusCode !== 200)
    throw new Error('附件上传失败')
  return parseUploadedAttachment(response.data).url
}
