/**
 * 项目内部导航适配入口。复用现有 tabbar 判断和路由拦截器，不决定业务目标或提示。
 * 导出 navigate、NavigationQuery、NavigationResult。
 * @example await navigate('/pages/detail/index', { id: 12 })
 */
import { isPageTabbar } from '@/tabbar/store'

export type NavigationQuery = Record<string, string | number | boolean | null | undefined>
export type NavigationResult = { ok: true } | { ok: false, error: unknown }

/**
 * 打开内部页面：普通页面 navigateTo，tabbar 页面 switchTab。
 * @param path 内部路径，可包含查询串；不接受外部链接或 hash。
 * @param query 附加参数，编码键和值，忽略 null/undefined，保留 0/false/空字符串。
 * @returns 导航结果；平台失败或同步异常均返回 ok:false，不自动弹提示。
 * tabbar 按 uni-app 规则不传查询参数；调用方不能依赖 tabbar query 传值。
 * @example const result = await navigate('/pages/detail/index', { name: '中文' })
 */
export function navigate(path: string, query?: NavigationQuery): Promise<NavigationResult> {
  return new Promise((resolve) => {
    try {
      const target = path.trim()
      if (!target || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target) || target.includes('#')) {
        resolve({ ok: false, error: new Error('Invalid internal navigation path') })
        return
      }
      const url = target.startsWith('/') ? target : `/${target}`
      const pathname = url.split('?')[0]
      const params = Object.entries(query ?? {})
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&')
      const options = {
        success: () => resolve({ ok: true }),
        fail: (error: unknown) => resolve({ ok: false, error }),
      }
      if (isPageTabbar(pathname))
        uni.switchTab({ url: pathname, ...options })
      else
        uni.navigateTo({ url: params ? `${url}${url.includes('?') ? '&' : '?'}${params}` : url, ...options })
    }
    catch (error) {
      resolve({ ok: false, error })
    }
  })
}
