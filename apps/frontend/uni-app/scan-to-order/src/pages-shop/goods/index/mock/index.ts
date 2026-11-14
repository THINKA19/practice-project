import type { GoodsEditForm } from '../models/edit'
import { authorize } from '@/pages-shop/auth/permissions/mock'
import { endpoints } from '../api/endpoints'
import { createGoodsSamples, goodsCategories } from './samples'

const records = new Map<string, ReturnType<typeof createGoodsSamples>>()

/** 在当前门店读取商品或更新已有商品的运营字段。 */
export function handle(endpoint: string, data: Record<string, unknown>, token: string): unknown {
  const shopId = String(data.shopId)
  authorize(token, shopId, 'goods.edit')
  let list = records.get(shopId)
  if (!list) {
    list = createGoodsSamples()
    records.set(shopId, list)
  }

  function view(entry: ReturnType<typeof createGoodsSamples>[number]) {
    const { name, cover, price, originPrice, sold, stock, status } = entry.form
    return { id: entry.id, version: entry.version, shopId, category: entry.category, name, cover, price, originPrice, sold, stock, status }
  }

  if (endpoint === endpoints.list) {
    const items = list.map(view)
    // 未请求分类的调用继续接收商品数组。
    return data.includeCategories === true ? { categories: [...goodsCategories], items } : items
  }

  const item = list.find(entry => entry.id === Number(data.id))
  if (!item)
    throw new Error('商品不存在')

  if (endpoint === endpoints.detail)
    return { version: item.version, form: JSON.parse(JSON.stringify(item.form)) as GoodsEditForm }

  if (item.version !== data.version)
    throw new Error('商品已更新，请刷新')

  if (endpoint === endpoints.save) {
    const patch = typeof data.form === 'string' ? JSON.parse(data.form) : null
    if (!patch || Object.keys(patch).length !== 1
      || !Number.isFinite(patch.price) || patch.price < 0
      || (item.form.originPrice && patch.price > item.form.originPrice)) {
      throw new Error('商品字段无效')
    }

    item.form.price = patch.price
  }
  else if (endpoint === endpoints.action && data.action === 'stock' && Number.isSafeInteger(data.value) && Number(data.value) >= 0) {
    item.form.stock = Number(data.value)
  }
  else {
    throw new Error('商品操作参数无效')
  }

  item.version++
  return view(item)
}

/** 重置所有门店的模拟商品。 */
export function reset() {
  records.clear()
}
