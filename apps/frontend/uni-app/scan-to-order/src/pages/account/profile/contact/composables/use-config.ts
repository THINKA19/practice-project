/** 客服配置加载、二维码预览、复制及拨号流程。 */
import { computed, onScopeDispose, ref } from 'vue'
import type { ContactChannel } from '../models/types'
import { parseServiceConfig } from '../models/mappers'
import { contactApi } from './use-requests'
import { confirm, showError, toast } from '@/utils/project/interaction'

/** 页面 onLoad 调用 load；销毁或新请求发起后丢弃过期结果。 */
export function useContactConfig() {
  const serviceData = ref(parseServiceConfig({}))
  const loading = ref(true)
  const loaded = ref(false)
  const failed = ref(false)
  const qrErrors = ref<Record<string, boolean>>({})
  const nativeContactAvailable = computed(() => {
    let enabled = false
    // #ifdef MP-WEIXIN
    enabled = serviceData.value.wechat_contact_enabled
    // #endif
    return enabled
  })
  const expandedIds = ref<string[]>([])
  const recommendedId = computed(() => (serviceData.value.channels.find(item => item.primary) || serviceData.value.channels[0])?.id)
  const canOpenLinks = ref(false)
  // #ifdef H5 || APP-PLUS
  canOpenLinks.value = true
  // #endif
  function toggleChannel(id: string) {
    expandedIds.value = expandedIds.value.includes(id) ? expandedIds.value.filter(value => value !== id) : [...expandedIds.value, id]
  }
  function isExpanded(id: string) {
    return expandedIds.value.includes(id)
  }
  let generation = 0
  let disposed = false
  onScopeDispose(() => {
    disposed = true
    generation++
  })

  async function load() {
    if (disposed)
      return
    const ticket = ++generation
    loading.value = true
    failed.value = false
    try {
      const data = await contactApi.config()
      if (ticket === generation && !disposed) {
        const previousIds = new Set(serviceData.value.channels.map(item => item.id))
        const wasLoaded = loaded.value
        serviceData.value = data
        const recommended = data.channels.find(item => item.primary) || data.channels[0]
        const retained = expandedIds.value.filter(id => data.channels.some(item => item.id === id))
        expandedIds.value = wasLoaded && data.channels.some(item => previousIds.has(item.id)) ? retained : recommended ? [recommended.id] : []
        qrErrors.value = {}
        loaded.value = true
      }
    }
    catch {
      if (ticket === generation && !disposed)
        failed.value = true
    }
    finally {
      if (ticket === generation && !disposed)
        loading.value = false
    }
  }

  function copy(value: string) {
    if (disposed)
      return
    if (!value)
      return toast('暂无联系方式')
    uni.setClipboardData({ data: value, fail: () => toast('复制失败，请重试') })
  }
  function previewQr(item: ContactChannel) {
    if (!item.qr_image || disposed)
      return
    uni.previewImage({ urls: [item.qr_image], current: item.qr_image, fail: () => toast('二维码预览失败，请重试') })
  }
  /** 打开已配置的公开链接；小程序复制链接，不假设可以跳出当前平台。 */
  function openLink(url: string) {
    if (disposed)
      return
    if (serviceData.value.demo)
      return toast('这是演示链接，请先配置真实渠道')
    if (!/^https?:\/\//i.test(url))
      return toast('联系链接无效')
    let handled = false
    // #ifdef H5
    try {
      window.open(url, '_blank', 'noopener,noreferrer')
      handled = true
    }
    catch { /* 浏览器无法打开时回退到复制。 */ }
    // #endif
    // #ifdef APP-PLUS
    if (!handled) {
      plus.runtime.openURL(url, () => copy(url))
      handled = true
    }
    // #endif
    if (!handled)
      copy(url)
  }
  function markQrFailed(id: string) {
    qrErrors.value[id] = true
  }
  function retryQr(id: string) {
    delete qrErrors.value[id]
  }
  async function showTelTips() {
    const phone = serviceData.value.phone
    const ticket = generation
    if (!phone || disposed)
      return toast('暂无有效联系电话')
    if (await confirm({ title: '拨打客服', content: phone, confirmText: '呼叫' }) && !disposed && ticket === generation)
      uni.makePhoneCall({ phoneNumber: phone, fail: showError })
  }
  return { serviceData, expandedIds, recommendedId, canOpenLinks, toggleChannel, isExpanded, openLink, nativeContactAvailable, loading, loaded, failed, load, copy, previewQr, qrErrors, markQrFailed, retryQr, showTelTips }
}
