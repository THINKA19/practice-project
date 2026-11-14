import { ref, watch } from 'vue'
import { shopText as st } from '@/locale/shop-text'
import type { ShopGoodsItem } from '../../models/index'
import { useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { confirm, showError, toast } from '@/utils/project/interaction'
import { goodsApi } from '../../api/goods'

export function useGoodsActions() {
  const context = useMerchantShopStore()
  const editor = ref<{ item: ShopGoodsItem, field: 'price' | 'stock' } | null>(null)
  const editorOpen = ref(false)
  const input = ref('')
  const saving = ref(false)

  watch(() => context.revision, () => {
    editorOpen.value = false
    editor.value = null
  })

  function openEditor(item: ShopGoodsItem, field: 'price' | 'stock') {
    if (saving.value || !context.can('goods.edit') || item.shopId !== context.current?.id)
      return
    if (field === 'stock' && item.stock !== 0)
      return
    editor.value = { item, field }
    input.value = field === 'price' ? String(item.price) : ''
    editorOpen.value = true
  }

  async function save(item: ShopGoodsItem, field: 'stock' | 'price', value: number, onDone?: (item: ShopGoodsItem) => void) {
    if (saving.value)
      return false
    saving.value = true
    try {
      const captured = context.capture('goods.edit')
      if (item.shopId !== captured.shopId)
        throw new Error(st('商品不属于当前门店'))
      const result = await (field === 'price'
        ? goodsApi.save(captured, item.id, item.version, { price: value })
        : goodsApi.action(captured, item, value))
      if (context.matches(captured)) {
        onDone?.(result)
        toast(st('已保存'), 'success')
        return true
      }
    }
    catch (error) {
      showError(error)
    }
    finally {
      saving.value = false
    }
    return false
  }
  async function markSoldOut(item: ShopGoodsItem, onDone?: (item: ShopGoodsItem) => void) {
    const revision = context.revision
    const confirmed = await confirm({ title: st('标记售罄'), content: st('确认将库存设为 0？') })
    if (confirmed && revision === context.revision)
      void save(item, 'stock', 0, onDone)
  }
  async function submitEditor(onDone: (item: ShopGoodsItem) => void) {
    const target = editor.value
    if (!target || !editorOpen.value || saving.value)
      return

    const raw = String(input.value).trim()
    const value = Number(raw)
    if (target.field === 'stock' && (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value <= 0)) {
      toast('请输入大于 0 的整数')
      return
    }
    if (target.field === 'price') {
      if (!/^\d+(?:\.\d+)?$/.test(raw) || !Number.isFinite(value)) {
        toast(st('请输入正确的售价'))
        return
      }
      if (target.item.originPrice > 0 && value > target.item.originPrice) {
        toast(st('划线价不能低于售价'))
        return
      }
    }

    if (await save(target.item, target.field, value, onDone))
      editorOpen.value = false
  }

  return { editor, editorOpen, input, saving, openEditor, submitEditor, markSoldOut }
}
