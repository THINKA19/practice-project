/**
 * 【文件概述】入驻申请与附件上传，实际接口必须配置；上传失败不提交申请。
 * 【方法与导出清单】见下方具名导出。
 * 【综合使用示例】通过所属模块 index.ts 调用。
 */
import { http } from '@/http/http'
import { getToken } from '@/pages/auth/session'

import { onboardingEndpoint } from './endpoints'

export const joinApplyApi = {
  addComment: (data: Record<string, string | number | undefined>) => http.post(onboardingEndpoint('VITE_SHOP_ONBOARDING_URL'), data),
  uploadFile: (filePath: string): Promise<{
    url: string
  }> => new Promise((resolve, reject) => {
    const url = onboardingEndpoint('VITE_SHOP_ONBOARDING_UPLOAD_URL')

    uni.uploadFile({ url, filePath, name: 'file', header: { Authorization: `Bearer ${getToken()}` }, success: (result) => {
      try {
        const body = JSON.parse(result.data)

        if (result.statusCode !== 200 || ![0, 200].includes(body.code) || typeof body.data?.url !== 'string' || !/^https?:\/\//.test(body.data.url))
          throw new Error('上传失败')

        resolve(body.data)
      }
      catch (error) {
        reject(error)
      }
    }, fail: reject })
  }),
}
