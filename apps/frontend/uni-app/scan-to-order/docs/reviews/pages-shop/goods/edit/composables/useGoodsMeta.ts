import type { AttrGroup, GoodsEditForm } from '../type'
import { ref } from 'vue'

/** 商品标签（最多 5 个） */
export const MAX_TAGS = 5

/** 标签 + 规格属性组编辑 */
export function useGoodsMeta(form: GoodsEditForm) {
  // ============ 标签 ============
  const tagInput = ref('')

  function addTag() {
    const v = tagInput.value.trim()
    if (!v)
      return
    if (form.tags.includes(v))
      return uni.showToast({ title: '标签已存在', icon: 'none' })
    if (form.tags.length >= MAX_TAGS)
      return uni.showToast({ title: `最多${MAX_TAGS}个标签`, icon: 'none' })
    form.tags.push(v)
    tagInput.value = ''
  }

  function removeTag(i: number) {
    form.tags.splice(i, 1)
  }

  // ============ 规格属性组 ============
  function addAttrGroup() {
    form.attrs.push({ k: '', list: [], required: false })
  }

  function removeAttrGroup(i: number) {
    form.attrs.splice(i, 1)
  }

  function addAttrValue(g: AttrGroup) {
    g.list.push('')
  }

  function removeAttrValue(g: AttrGroup, i: number) {
    g.list.splice(i, 1)
  }

  return {
    tagInput,
    addTag,
    removeTag,
    addAttrGroup,
    removeAttrGroup,
    addAttrValue,
    removeAttrValue,
  }
}
