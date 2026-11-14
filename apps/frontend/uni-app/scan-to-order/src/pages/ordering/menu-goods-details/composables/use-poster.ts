/**
 * ============================================================================
 * 【文件概述】商品详情 / composables/use-poster.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - PosterSource：数据类型契约。
 * - useGoodsDetailPoster：本文件对外声明。
 * 【综合使用示例】
 * import type { PosterSource } from '@/pages/ordering/menu-goods-details/composables/use-poster'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/**
 * 商品详情 - 分享海报 ViewModel
 * 来源：bee-master/pages/goods-details/index.js drawSharePic / onPosterSuccess / onPosterFail / closePop
 * 小程序码由 system 上下文生成；canvas 绘制与保存相册在 components/GoodsPoster.vue（纯 UI 能力）
 */
import type { Ref } from 'vue'
import type { GoodsDetail } from '@/pages/ordering/menu'
import { useSessionState } from '@/pages/auth/session'
import { goodsMediaApi } from '@/pages/ordering/menu-goods-details'
import { showError } from '@/utils/project/interaction'

/**
 * 海报绘制数据（传给 GoodsPoster 组件）
 * 结构字段：pic、name、price、qrcode；必填与可选字段见声明。
 * @example
 * import type { PosterSource } from '@/pages/ordering/menu-goods-details/composables/use-poster'
 * declare const response: PosterSource
 * const value: PosterSource = response // => 保留 PosterSource 的字段与取值约束
 */
export interface PosterSource {
  pic: string
  name: string
  price: number | string
  qrcode: string
}

/**
 * 创建 use-poster 对应的领域状态与交互能力。
 * @param detail {Ref<GoodsDetail | null>} 当前商品或门店详情。
 * @returns 对象，包含 source、generating、drawSharePic、closePoster、onPosterFail。
 * @example
 * import { useGoodsDetailPoster } from '@/pages/ordering/menu-goods-details/composables/use-poster'
 * declare const detail: Parameters<typeof useGoodsDetailPoster>[0]
 * useGoodsDetailPoster(detail) // => 对象，包含 source、generating、drawSharePic、closePoster、onPosterFail
 */
export function useGoodsDetailPoster(detail: Ref<GoodsDetail | null>) {
  const session = useSessionState()

  const source = ref<PosterSource | null>(null)

  const generating = ref(false)

  /** 生成小程序码并触发海报绘制（原 drawSharePic） */

  async function drawSharePic() {
    const b = detail.value?.basicInfo

    if (!b || generating.value) {
      return
    }

    generating.value = true

    try {
      const qrcode = await goodsMediaApi.wxaQrcode({
        scene: `${b.id},${String(session.userInfo.userId)}`,
        page: 'pages/ordering/menu-goods-details/index',
        is_hyaline: true,
        autoColor: true,
        expireHours: 1,
      })
      source.value = { pic: b.pic, name: b.name, price: b.minPrice, qrcode }
    }
    catch (e) {
      showError(e)
    }
    finally {
      generating.value = false
    }
  }

  /** 关闭海报（原 closePop / savePosterPic complete） */

  function closePoster() {
    source.value = null
  }

  /** 绘制失败（原 onPosterFail） */

  function onPosterFail(e: unknown) {
    console.error('poster fail:', e)

    source.value = null

    showError(e)
  }

  return { source, generating, drawSharePic, closePoster, onPosterFail }
}
