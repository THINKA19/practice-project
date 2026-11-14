import type { ShopGoodsCatalog, ShopGoodsItem } from '../../models/index'
import { onShow } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'
import { useTabFilter } from '@/hooks/project/useTabFilter'
import { useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { toast } from '@/utils/project/interaction'
import { goodsApi } from '../../api/goods'

const allTab = { key: '', label: '全部' }
export function useGoodsList() {
  const context = useMerchantShopStore()
  const catalog = ref<ShopGoodsCatalog>({ categories: [], items: [] })
  const goods = computed(() => catalog.value.items)
  const categories = computed(() => [
    allTab,
    ...catalog.value.categories.map(name => ({ key: name, label: name })),
  ])
  const { activeIndex: activeCate, list } = useTabFilter<ShopGoodsItem, string>({
    source: goods,
    get tabs() { return categories.value },
    allKey: allTab.key,
    match: (item, cate) => {
      if (cate === '售罄')
        return item.stock === 0
      if (cate === '热销')
        return item.sold > 100
      return item.category === cate
    },
  })
  watch(() => context.revision, () => {
    catalog.value = { categories: [], items: [] }
    activeCate.value = 0
  }, { flush: 'sync' })
  async function refresh() {
    try {
      const captured = context.capture('goods.edit')
      const result = await goodsApi.list(captured)
      if (!context.matches(captured))
        return
      if (!Array.isArray(result?.categories) || !Array.isArray(result?.items))
        throw new Error('商品目录数据格式无效')
      const selected = categories.value[activeCate.value]?.key
      const names = result.categories.filter(name => typeof name === 'string' && name.trim() && name !== allTab.label)
      catalog.value = { categories: [...new Set(names)], items: result.items }
      activeCate.value = Math.max(0, categories.value.findIndex(tab => tab.key === selected))
    }
    catch (reason) {
      toast(reason instanceof Error ? reason.message : '商品加载失败')
    }
  }
  onShow(async () => {
    await context.refresh()
    await refresh()
  })
  function applyLocalChange(item: ShopGoodsItem) {
    const index = goods.value.findIndex(g => g.id === item.id)
    if (index >= 0)
      goods.value[index] = item
  }
  return { goods, activeCate, categories, list, refresh, applyLocalChange }
}
