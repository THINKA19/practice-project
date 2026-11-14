import type { ShopGoodsItem } from '../type'
import { computed, ref } from 'vue'
import { useTabFilter } from '@/hooks/useTabFilter'
import { clonePlain } from '@/pages-shop/utils/clone'
import { pendingData } from '@/mock/pending'

/**
 * 分类 Tab：key 空串 = 全部，其余与商品字段一一对应
 * 文案里的数量暂为写死的演示值（上线由接口聚合），所以这个数组必须是「文案 + 过滤维度」一份数据，
 * 不能再拆成「文案数组」和「下标 → 分类数组」两份靠下标对齐
 */
export const GOODS_CATE_TABS: { key: string, label: string }[] = [
  { key: '', label: '全部(24)' },
  { key: '热销', label: '热销(8)' },
  { key: '主食', label: '主食(6)' },
  { key: '小吃', label: '小吃(4)' },
  { key: '饮料', label: '饮料(4)' },
  { key: '套餐', label: '套餐(2)' },
]

/**
 * 演示商品数据 —— 接口未接入，非 mock 构建下按空数组渲染（见 src/mock/pending.ts）
 * 真实接口：GET /shop/goods/list（分页 + 分类 + 关键字）
 */
const DEMO_GOODS: ShopGoodsItem[] = pendingData('GET /shop/goods/list', [
  { id: 1, name: '香辣鸡腿堡', cover: '', price: 18, originPrice: 22, sold: 328, stock: 98, category: '主食', status: 1 },
  { id: 2, name: '招牌牛肉面', cover: '', price: 28, originPrice: 32, sold: 156, stock: 50, category: '主食', status: 1 },
  { id: 3, name: '薯条(大)', cover: '', price: 12, originPrice: 15, sold: 280, stock: 200, category: '小吃', status: 1 },
  { id: 4, name: '可乐(中)', cover: '', price: 8, originPrice: 10, sold: 410, stock: 0, category: '饮料', status: 0 },
  { id: 5, name: '儿童套餐A', cover: '', price: 32, originPrice: 38, sold: 86, stock: 30, category: '套餐', status: 1 },
  { id: 6, name: '鸡翅(4块)', cover: '', price: 16, originPrice: 20, sold: 200, stock: 120, category: '小吃', status: 1 },
])

/** 商品列表：分类筛选 + 关键字搜索（分类过滤见 @/hooks/useTabFilter） */
export function useGoodsList() {
  // 与其余列表页统一用深拷贝：`{ ...item }` 只对当前的扁平字段安全，
  // 一旦商品新增规格 / 图片等嵌套字段，手工浅拷贝就会静默共享引用
  const goods = ref<ShopGoodsItem[]>(clonePlain(DEMO_GOODS))
  const keywords = ref('')

  const { activeIndex: activeCate, list: cateFiltered } = useTabFilter<ShopGoodsItem, string>({
    source: goods,
    tabs: GOODS_CATE_TABS,
    allKey: '',
    // 「热销」是销量维度，不是分类维度；其余 Tab 直接比分类名
    match: (item, cate) => cate === '热销' ? item.sold > 100 : item.category === cate,
  })

  /** 关键字搜索叠加在分类筛选之上（搜索词与 Tab 无关，所以不进 Tab 计数） */
  const list = computed<ShopGoodsItem[]>(() => {
    const kw = keywords.value.trim()
    return kw ? cateFiltered.value.filter(x => x.name.includes(kw)) : cateFiltered.value
  })

  /** 编辑页保存后同步本地状态（真实接口接入前无共享后端） */
  function applyLocalChange(item: ShopGoodsItem) {
    const idx = goods.value.findIndex(g => g.id === item.id)
    if (idx >= 0)
      goods.value[idx] = clonePlain(item)
    else
      goods.value.unshift(clonePlain(item))
  }

  return {
    goods,
    activeCate,
    keywords,
    categories: GOODS_CATE_TABS,
    list,
    applyLocalChange,
  }
}
