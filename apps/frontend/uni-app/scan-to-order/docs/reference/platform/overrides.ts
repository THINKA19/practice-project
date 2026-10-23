// 历史参考资料：禁止正式业务导入；按需提取到正式模块后再接入和验证。
/**
 * ============================================================================
 * 平台能力替身与依赖注入拦截器 (Platform Overrides)
 * ============================================================================
 *
 * 【文件概述】
 * 本文件处于共享平台层（Shared Platform），提供原生平台 API 的运行期替换机制。
 *
 * 核心机制：
 * 在本地开发环境、H5 演示环境或自动化 E2E 测试时，真实的宿主环境（如微信登录、
 * 微信支付）不可用。上层应用（如 mock 插件或环境配置层）可通过本文件注册
 * 替身函数（Mock API）。底层的 device.ts 在调用原生 API 前会优先查询此处，
 * 从而实现原生能力的无感降级与本地全链路流程闭环。
 *
 * 【使用示例】
 * ```typescript
 * // 在应用的开发环境初始化入口 (如 main.ts 或 mock/index.ts) 中：
 * import { registerPlatformOverrides } from './overrides'
 *
 * if (import.meta.env.DEV) {
 *   registerPlatformOverrides({
 *     // 拦截并模拟微信登录
 *     loginCode: async () => 'mock_wx_login_code_888',
 *
 *     // 拦截并模拟支付成功
 *     requestPayment: async (params) => {
 *       console.log('拦截到发起支付请求，参数:', params)
 *       await new Promise(r => setTimeout(r, 1000))
 *       console.log('模拟支付成功！')
 *     }
 *   })
 * }
 * ```
 * ============================================================================
 */

/** 原生支付唤起所需的通用参数结构（如微信支付所需的五元组） */
export interface PlatformPaymentParams {
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

/**
 * 允许被顶层拦截与重写的平台能力清单
 * 这里的每一个方法签名必须与 device.ts 中的真实能力出入参保持绝对一致
 */
export interface PlatformOverrides {
  /** 替代 uni.login 获取授权码 */
  loginCode?: () => Promise<string>
  /** 替代 uni.checkSession 检查环境登录态 */
  checkSession?: () => Promise<boolean>
  /** 替代 uni.requestPayment 拦截真实支付流程 */
  requestPayment?: (params: PlatformPaymentParams) => Promise<void>
}

// 内部持有的替身注册表实例
let overrides: PlatformOverrides = {}

/**
 * 注册/注入平台能力的替身实现
 * 通常只在开发环境或特定的测试包中调用，线上生产环境保持空置
 *
 * @param value 包含替换逻辑的对象
 */
export function registerPlatformOverrides(value: PlatformOverrides) {
  // 使用浅拷贝防止外部对象突变导致内部状态失控
  overrides = { ...value }
}

/**
 * 读取当前系统中激活的替身配置
 * 供底层的 device.ts 在发起真实原生调用前进行探查与熔断
 *
 * @returns 只读的替身配置字典
 */
export function getPlatformOverrides(): Readonly<PlatformOverrides> {
  return overrides
}
