/** 分享接口返回原始凭证字符串，空凭证不能进入赠送流程。 */
export function parseShareToken(value: unknown): string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error('未取得有效的分享凭证')
  return value
}
