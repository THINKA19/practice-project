import type { ShopSettingsForm } from '../models/index'
import { localDay } from '../composables/index/businessSchedule'

export const settings = new Map<string, { form: ShopSettingsForm, version: number }>()

/** 读取模拟授权和工作台共用的已保存门店概况。 */
export function savedShopOverview(shopId: string) {
  const form = settings.get(shopId)?.form
  if (!form)
    return undefined

  const today = localDay(new Date())
  const plan = form.temporaryClosure
  const closed = !!plan && (!plan.from || plan.from <= today) && today <= plan.until
  return { name: form.shopName, open: form.businessStatus && !closed, soundNotify: form.soundNotify }
}
