import type { ContactItem } from '../models/contact'
import { ref } from 'vue'

export function useContactDock() {
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
