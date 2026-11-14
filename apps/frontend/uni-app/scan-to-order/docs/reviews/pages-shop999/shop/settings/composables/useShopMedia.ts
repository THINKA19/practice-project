import type { ShopSettingsForm } from '../type'
import { chooseImages } from '@/utils/image'

/** 选图失败的统一提示（用户主动取消不会走到这里，见 chooseImages 注释） */
function toastChooseFailed() {
  uni.showToast({ title: '选择图片失败，请重试', icon: 'none' })
}

/** 店铺图片与位置上传 */
export function useShopMedia(form: ShopSettingsForm) {
  async function chooseLogo() {
    try {
      const [path] = await chooseImages({ count: 1 })
      if (path)
        form.shopLogo = path
    }
    catch {
      toastChooseFailed()
    }
  }

  async function chooseShopPhoto() {
    try {
      const [path] = await chooseImages({ count: 1 })
      if (path)
        form.shopPhoto = path
    }
    catch {
      toastChooseFailed()
    }
  }

  function chooseLocation() {
    uni.chooseLocation({
      success: (r) => {
        form.address = r.address + r.name
        form.longitude = r.longitude
        form.latitude = r.latitude
        uni.showToast({ title: '位置已更新', icon: 'success' })
      },
      fail: (err) => {
        if (err.errMsg?.includes('cancel'))
          return
        uni.showToast({ title: '选点失败，请检查权限', icon: 'none' })
      },
    })
  }

  return { chooseLogo, chooseShopPhoto, chooseLocation }
}
