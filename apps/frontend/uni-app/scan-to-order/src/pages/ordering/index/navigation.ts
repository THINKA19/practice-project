/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / navigation.ts
 * 领域内部实现：维护当前文件声明的配置与操作。
 * 【方法与导出清单】
 * - openShopList：设置本次配送方式与返回目标，进入统一门店列表。
 * - clearShopSelectionTarget：清除本次门店选择的返回目标。
 * - takeShopSelectionTarget：读取并消费本次选店返回目标。
 * - takeShopListFreshEntry：读取并消费列表重新进入标记。
 * 【综合使用示例】
 * import { openShopList } from '@/pages/ordering/index/navigation'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
/** 平台商家列表导航；配送方式通过业务状态传递，换店目标不持久化。 */
import type { PeisongType } from './models/types'
import { useShopStore } from './store'
import { ClientRoutes } from '@/pages/routes'
import { navigate } from '@/utils/project/navigation'

let selectionTarget: string | undefined
let freshEntry = false

/**
 * 设置本次配送方式与返回目标，进入统一门店列表。
 * @param options 配送方式、选店后目标及进入模式；fresh 重置列表，resume 返回已有列表继续浏览。
 * @returns Promise<NavigationResult>；导航失败时清理本次返回目标与进入标记。
 * @example
 * import { openShopList } from '@/pages/ordering/index/navigation'
 * await openShopList({ deliveryType: 'kd' }) // => 请求进入配送选店列表，返回导航结果
 */
export async function openShopList(options: { deliveryType?: PeisongType, returnTo?: string, mode?: 'fresh' | 'resume' } = {}) {
  if (options.deliveryType) {
    useShopStore().setScanDining(null)
    useShopStore().setPeisongType(options.deliveryType)
  }
  selectionTarget = options.returnTo
  freshEntry = options.mode !== 'resume'
  // 继续浏览时优先返回原列表实例，保留 z-paging 的数据与分页进度。
  if (options.mode === 'resume') {
    const pages = getCurrentPages()
    const index = pages.findIndex(page => `/${page.route}` === ClientRoutes.Ordering.shops)
    const delta = pages.length - 1 - index
    if (index >= 0 && delta > 0) {
      const returned = await new Promise<boolean>((resolve) => {
        uni.navigateBack({ delta, success: () => resolve(true), fail: () => resolve(false) })
      })
      if (returned)
        return { ok: true } as const
    }
  }
  const result = await navigate(ClientRoutes.Ordering.shops)
  if (!result.ok) {
    selectionTarget = undefined
    freshEntry = false
  }
  return result
}

/**
 * 清除本次门店选择的返回目标。 无参数。
 * @returns {void} 清理本次选店的返回目标。
 * @example
 * import { clearShopSelectionTarget } from '@/pages/ordering/index/navigation'
 * clearShopSelectionTarget() // => void；执行本方法声明的副作用
 */
export function clearShopSelectionTarget() {
  selectionTarget = undefined
}

/**
 * 读取并消费本次选店返回目标。 无参数。
 * @returns string | undefined，本次返回路径；读取后立即清除。
 * @example
 * import { takeShopSelectionTarget } from '@/pages/ordering/index/navigation'
 * takeShopSelectionTarget() // => 本次返回路径或 undefined；第二次读取为 undefined
 */
export function takeShopSelectionTarget() {
  const target = selectionTarget
  selectionTarget = undefined
  return target
}

/**
 * 程序跳转进入列表时消费一次重置标记；菜单返回不设置此标记。
 * @returns boolean。
 * @example
 * import { takeShopListFreshEntry } from '@/pages/ordering/index/navigation'
 * takeShopListFreshEntry() // => boolean
 */
export function takeShopListFreshEntry() {
  const fresh = freshEntry
  freshEntry = false
  return fresh
}
