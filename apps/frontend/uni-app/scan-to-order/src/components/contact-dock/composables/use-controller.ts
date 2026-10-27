import type { ContactItem } from '../models/contact'
import { ref } from 'vue'

/** 维护当前组件的展开与联系方式弹窗状态；复制和外链行为按平台执行，不保存业务账号。 */
export function useContactDockController() {
  const expanded = ref(true)
  const selected = ref<ContactItem | null>(null)
  const showContact = ref(false)
  function copy(value: string) {
    uni.setClipboardData({ data: value })
  }
  function activate(item: ContactItem) {
    if (item.action.type === 'copy') {
      selected.value = item
      showContact.value = true
      return
    }
    // #ifdef H5
    window.open(item.action.value, '_blank', 'noopener,noreferrer')
    // #endif
    // #ifdef APP-PLUS
    plus.runtime.openURL(item.action.value)
    // #endif
    // #ifndef H5
    // #ifndef APP-PLUS
    copy(item.action.value)
    // #endif
    // #endif
  }
  return { expanded, selected, showContact, copy, activate }
}
