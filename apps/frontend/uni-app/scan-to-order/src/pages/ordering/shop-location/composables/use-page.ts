/**
 * ============================================================================
 * 【文件概述】门店位置页编排，拥有地址参数校验、无效状态与地址复制交互。
 * 【方法与导出清单】useShopLocationPage：位置页实例；门店读取复用详情公开能力。
 * 【综合使用示例】import { useShopLocationPage } from '@/pages/ordering/shop-location'; const vm = useShopLocationPage(); vm.init({ id: '1' })
 * ============================================================================
 */
import { computed, getCurrentScope, onScopeDispose, ref, watch } from 'vue'
import { useShopDetailPage } from '@/pages/ordering/shop-detail'
import { amapNavigationUrl, baiduNavigationUrl, googleNavigationUrl, tencentNavigationUrl } from '@/pages/ordering/index'
import { openLink } from '@/pages/ordering/menu'

/**
 * 创建位置页独立状态，装配门店地图数据及位置交互。
 * @returns invalid、init、copyAddress 和复用的门店详情能力；无参数。
 * @example const vm = useShopLocationPage(); vm.init({ id: '0' }) // => invalid.value 为 true
 */
export function useShopLocationPage() {
  const detail = useShopDetailPage()
  const addressCopied = ref(false)
  let copyTimer: ReturnType<typeof setTimeout> | undefined
  let copyRevision = 0
  function clearCopyFeedback() {
    copyRevision++
    addressCopied.value = false
    clearTimeout(copyTimer)
  }
  if (getCurrentScope())
    onScopeDispose(clearCopyFeedback)
  const regionAddress = computed(() => {
    const shop = detail.shopInfo.value
    return [shop?.countryName, shop?.cityName, shop?.districtName]
      .filter((name): name is string => typeof name === 'string' && !!name.trim())
      .join(' · ')
  })
  const invalid = ref(false)
  const navigationVisible = ref(false)
  const navigationOptions = computed(() => {
    const shop = detail.shopInfo.value
    if (!googleNavigationUrl(shop))
      return []
    const options = [
      { id: 'google', label: 'Google Maps', url: googleNavigationUrl(shop) },
    ]
    // #ifdef MP
    options.push(
      { id: 'amap', label: '高德地图', url: amapNavigationUrl(shop) },
      { id: 'tencent', label: '腾讯地图', url: tencentNavigationUrl(shop) },
      { id: 'baidu', label: '百度地图', url: baiduNavigationUrl(shop) },
    )
    // #endif
    // #ifdef MP
    if (detail.location.value)
      options.unshift({ id: 'native', label: '内置地图', url: '' })
    // #endif
    return options
  })
  watch(() => detail.shopInfo.value?.id, () => {
    navigationVisible.value = false
  })
  const navigationUrl = computed(() => googleNavigationUrl(detail.shopInfo.value))

  /** 校验 URL 门店编号并加载快照。@param query URL 参数，id 为正整数文本。@returns void；无效时不请求。@example init({ id: '0' }) // => 标记无效 */
  function init(query: { id?: string } = {}) {
    navigationVisible.value = false
    clearCopyFeedback()
    const id = Number(query.id)
    invalid.value = !Number.isInteger(id) || id <= 0
    void detail.init(invalid.value ? {} : { id: String(id) })
  }

  /** 复制当前门店地址。@returns void；无地址时不操作，无参数。@example copyAddress() // => 有地址时调用系统剪贴板 */
  function copyAddress() {
    if (detail.shopInfo.value?.address)
      copyText(detail.shopInfo.value.address)
  }

  function copyText(data: string) {
    clearCopyFeedback()
    const revision = copyRevision
    uni.setClipboardData({
      data,
      showToast: false,
      success: () => {
        if (revision !== copyRevision)
          return
        addressCopied.value = true
        copyTimer = setTimeout(() => {
          addressCopied.value = false
        }, 1500)
      },
      fail: () => {
        if (revision === copyRevision)
          uni.showToast({ title: '复制失败，请重试或手动复制地址', icon: 'none' })
      },
    })
  }

  /** 浏览器直接打开 Google，小程序展开平台地图选项。 */
  function startNavigation() {
    // #ifdef MP
    if (navigationOptions.value.length)
      navigationVisible.value = true
    // #endif
    // #ifndef MP
    if (navigationUrl.value)
      openLink(navigationUrl.value)
    // #endif
  }

  function closeNavigation() {
    navigationVisible.value = false
  }

  /** 按当前门店重新查找选项，不使用旧面板残留的目的地。 */
  function selectNavigation(id: string) {
    if (!navigationVisible.value)
      return
    const option = navigationOptions.value.find(item => item.id === id)
    if (!option)
      return
    const { url, label } = option
    closeNavigation()
    if (id === 'native') {
      detail.startNavigation()
      return
    }
    // #ifndef MP
    openLink(url)
    return
    // #endif
    // #ifdef MP
    uni.setClipboardData({
      data: url,
      success: () => uni.showModal({ title: `${label}链接已复制`, content: '请粘贴到浏览器中打开。', showCancel: false }),
      fail: () => uni.showToast({ title: '复制失败，请重试或复制门店地址', icon: 'none' }),
    })
    // #endif
  }
  return { ...detail, regionAddress, addressCopied, clearCopyFeedback, invalid, init, copyAddress, navigationUrl, navigationVisible, navigationOptions, closeNavigation, selectNavigation, startNavigation }
}
