import type { GoodsEditForm } from '../type'
import { chooseImages } from '@/utils/image'

/** 轮播图最大张数（页面占位格子数量与此保持一致） */
export const MAX_BANNERS = 5

/** 商品图片：主图 + 轮播图（最多 MAX_BANNERS 张） */
export function useGoodsMedia(form: GoodsEditForm) {
  async function chooseCover() {
    try {
      const [path] = await chooseImages({ count: 1 })
      if (path)
        form.cover = path
    }
    catch {
      uni.showToast({ title: '选择图片失败，请重试', icon: 'none' })
    }
  }

  /**
   * 追加轮播图
   * 剩余可选数量按已选张数计算：否则选满后仍能一次选 5 张，
   * 多出来的会被 slice 静默丢弃（用户看到"选了却被吃掉"）。
   */
  async function chooseBanners() {
    const rest = MAX_BANNERS - form.banners.length
    if (rest <= 0) {
      uni.showToast({ title: `最多上传 ${MAX_BANNERS} 张`, icon: 'none' })
      return
    }

    try {
      const paths = await chooseImages({ count: rest })
      if (paths.length)
        form.banners = [...form.banners, ...paths].slice(0, MAX_BANNERS)
    }
    catch {
      uni.showToast({ title: '选择图片失败，请重试', icon: 'none' })
    }
  }

  function removeBanner(i: number) {
    form.banners.splice(i, 1)
  }

  return { chooseCover, chooseBanners, removeBanner }
}
