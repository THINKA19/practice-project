/**
 * ============================================================================
 * 【文件概述】结算与支付 / composables/use-delivery.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - usePayDelivery：本文件对外声明。
 * - DeliveryVm：数据类型契约。
 * 【综合使用示例】
 * import { usePayDelivery } from '@/pages/ordering/menu-pay/composables/use-delivery'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { distanceLine, orderingSettings, shopApi, toDistance, useShopStore } from '@/pages/ordering/index'
import { matchPeisongFee } from '../domain/payment.rules'
import { paymentApi } from '../api/payment.api'
import { toDeliveryFees } from '../models/payment.mappers'
/**
 * 结算页 - 配送相关 ViewModel
 * 自取/配送切换、默认地址、距离、配送费阶梯、保温袋（打包费）
 * 来源：bee-master/pages/pay/index.js onShow / selected / initShippingAddress / getDistance /
 *      getDistanceLine / _pickPoints / _peisonFeeList / selectPickPoint / packaging_fee_*
 */
import type { Ref } from 'vue'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { getSessionRevision } from '@/pages/auth/session'
import type { PayShop } from '../models/types'
import type { Address } from '@/pages/account/profile/address'
import type { PeisongFee } from '../models/payment.types'
import type { PeisongType } from '@/pages/ordering/index'
import { addressApi } from '@/pages/account/profile/address'
import { toast } from '@/utils/project/interaction'
import { navigate as go } from '@/utils/project/navigation'

import { ClientRoutes } from '@/pages/routes'

/** 经纬度必须明确有效，缺失不可当作零公里。 */
function validPoint(point: { latitude?: unknown, longitude?: unknown } | null | undefined) {
  return !!point && point.latitude != null && point.longitude != null
    && String(point.latitude).trim() !== '' && String(point.longitude).trim() !== ''
    && Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude))
    && Math.abs(Number(point.latitude)) <= 90 && Math.abs(Number(point.longitude)) <= 180
}

/**
 * 创建 use-delivery 对应的领域状态与交互能力。
 * @param t {(key: string) => string} 从当前语言资源读取文案的函数。
 * @returns 对象，包含 shopInfo、peisongType、curAddress、distance、packagingFeeUse、packagingFee、showBothTypes、isOutOfRange、syncShopAndType、selectPeisongType、loadPeisongFeeList、loadDefaultAddress、resolvePeisongFeeId、goAddress、goShopDetail、setPackagingFeeUse。
 * @example
 * import { usePayDelivery } from '@/pages/ordering/menu-pay/composables/use-delivery'
 * declare const t: Parameters<typeof usePayDelivery>[0]
 * usePayDelivery(t) // => 对象，包含 shopInfo、peisongType、curAddress、distance、packagingFeeUse、packagingFee、showBothTypes、isOutOfRange、syncShopAndType、selectPeisongType、loadPeisongFeeList、loadDefaultAddress、resolvePeisongFeeId、goAddress、goShopDetail、setPackagingFeeUse
 */
export function usePayDelivery(t: (key: string) => string) {
  const shopStore = useShopStore()

  const shopInfo = ref<PayShop | null>(null)

  const peisongType = ref<PeisongType>('zq')
  /** 当前收货地址（null 表示无默认地址） */

  const curAddress = ref<Address | null>(null)

  const distance = ref<number | null>(null)
  const hasAddresses = ref(false)
  let selectedAddressId: number | undefined
  let disposed = false
  let channel: { off: (event: string) => void } | undefined
  const addressError = ref(false)
  const addressLoading = ref(false)
  let addressSeq = 0
  const peisongFeeList = ref<PeisongFee[] | null>(null)
  const feeError = ref(false)
  let feeSeq = 0
  watch(() => JSON.stringify([getSessionRevision(), shopStore.current?.id]), () => {
    selectedAddressId = undefined
    feeSeq++
    peisongFeeList.value = null
    feeError.value = false
    hasAddresses.value = false
    addressSeq++
    curAddress.value = null
    distance.value = null
    addressError.value = false
    addressLoading.value = false
  }, { flush: 'sync' })
  watch(peisongType, () => {
    feeSeq++
    peisongFeeList.value = null
    feeError.value = false
    addressSeq++
    curAddress.value = null
    distance.value = null
    addressError.value = false
    addressLoading.value = peisongType.value === 'kd'
  }, { flush: 'sync' })
  onScopeDispose(() => {
    disposed = true
    channel?.off('addressSelected')
    addressSeq++
    feeSeq++
  })

  /** 自提是否需要保温袋：'1' 需要 '2' 不需要 */

  const packagingFeeUse = ref<'1' | '2'>('1')

  const packagingFee = computed(() => (orderingSettings.packaging_fee ?? ''))

  const showBothTypes = computed(() => !!(shopInfo.value?.openWaimai && shopInfo.value?.openZiqu))
  const deliveryIssue = computed(() => {
    if (peisongType.value !== 'kd' || !curAddress.value || addressLoading.value || addressError.value)
      return null
    // 普通配送由服务端按地址核价；第三方配送协议仍要求明确的收货坐标。
    if (shopInfo.value?.expressType === 'dada' && !validPoint(curAddress.value))
      return { kind: 'address', message: '该配送方式需要收货位置，请补充地址定位', actionText: '补充定位' }
    if (isOutOfRange())
      return { kind: 'range', message: '该地址超出门店配送范围', actionText: '更换地址' }
    if (peisongFeeList.value?.length && distance.value !== null && !matchPeisongFee(peisongFeeList.value, distance.value))
      return { kind: 'range', message: '该地址不在门店配送计费范围内', actionText: '更换地址' }
    return null
  })
  const availabilityReason = computed<string>(() => {
    if (peisongType.value !== 'kd')
      return ''
    if (addressLoading.value)
      return '地址加载中，请稍候'
    if (addressError.value)
      return '地址加载失败，请重试'
    if (!curAddress.value)
      return hasAddresses.value ? '请选择收货地址' : '请添加收货地址'
    return deliveryIssue.value?.message || ''
  })

  /** 超出配送范围（仅外卖） */

  function isOutOfRange(d = distance.value) {
    const max = Number(shopInfo.value?.serviceDistance)

    return Number.isFinite(max) && max > 0 && d !== null && d > max && peisongType.value === 'kd'
  }

  /** onShow：从缓存读取门店与配送方式（门店只开一种时强制） */

  function syncShopAndType() {
    const shop = (shopStore.current || null) as PayShop | null

    let type: PeisongType = shopStore.peisongType || 'zq'

    if (shop?.openWaimai && !shop.openZiqu) {
      type = 'kd'
    }

    if (shop && !shop.openWaimai && shop.openZiqu) {
      type = 'zq'
    }

    shopInfo.value = shop

    peisongType.value = type
    if (type === 'kd')
      addressLoading.value = true
  }

  /** 切换配送方式（原 selected），写回缓存 */

  function selectPeisongType(type: PeisongType) {
    if (type === peisongType.value)
      return false
    if (shopStore.isScanMode || (type === 'kd' ? !shopInfo.value?.openWaimai : !shopInfo.value?.openZiqu))
      return false
    peisongType.value = type
    shopStore.setPeisongType(type)
    return true
  }

  async function loadPeisongFeeList() {
    const seq = ++feeSeq
    peisongFeeList.value = null
    feeError.value = false
    try {
      const rows = await paymentApi.peisongFeeList().then(toDeliveryFees)
      if (!disposed && seq === feeSeq)
        peisongFeeList.value = rows
    }
    catch {
      if (!disposed && seq === feeSeq)
        feeError.value = true
    }
  }

  /** 门店与收货地址之间的距离（km） */

  async function getDistance(addr: Address | null | undefined): Promise<number | null> {
    const shop = shopInfo.value

    if (!validPoint(shop) || !validPoint(addr)) {
      return null
    }
    if (!shop || !addr)
      return null

    const qqMapKey = (orderingSettings.QQ_MAP_KEY ?? '')

    if (qqMapKey === '1') {
      try {
        const meters = toDistance(await shopApi.gpsDistance({
          key: qqMapKey,
          mode: 'bicycling',
          from: `${shop.latitude},${shop.longitude}`,
          to: `${addr.latitude},${addr.longitude}`,
        }))

        return Number.isFinite(meters) && meters >= 0 ? meters / 1000.0 : null
      }
      catch {
        return null
      }
    }
    // 只能计算直线距离

    const d = distanceLine(Number(shop.latitude), Number(shop.longitude), Number(addr.latitude), Number(addr.longitude)) / 1000
    return Number.isFinite(d) && d >= 0 ? d : null
  }

  /** 读取默认收货地址并计算距离（原 initShippingAddress 前半段） */

  async function loadDefaultAddress() {
    if (disposed)
      return
    const seq = ++addressSeq
    addressLoading.value = true
    addressError.value = false
    try {
      const rows = await addressApi.list({ pageSize: 100 })
      if (seq !== addressSeq)
        return
      hasAddresses.value = rows.length > 0
      const selected = rows.find(item => item.id === selectedAddressId)
      if (!selected)
        selectedAddressId = undefined
      const next = selected || rows.find(item => item.isDefault) || (rows.length === 1 ? rows[0] : null)
      const d = await getDistance(next)
      if (seq !== addressSeq)
        return
      curAddress.value = next
      distance.value = d
    }
    catch (error) {
      if (seq !== addressSeq)
        return
      curAddress.value = null
      distance.value = null
      addressError.value = true
      throw error
    }
    finally {
      if (seq === addressSeq)
        addressLoading.value = false
    }
  }

  /** 外卖时匹配配送费档位 id */

  async function resolvePeisongFeeId(): Promise<number | undefined> {
    if (!peisongFeeList.value?.length || peisongType.value !== 'kd') {
      return undefined
    }

    const d = await getDistance(curAddress.value)
    if (d === null)
      return undefined

    const fee = matchPeisongFee(peisongFeeList.value, d)
    if (!fee)
      throw new Error('该地址不在门店配送计费范围内')
    return fee.id
  }

  function goAddress(edit = false) {
    if (addressLoading.value)
      return
    channel?.off('addressSelected')
    const revision = getSessionRevision()
    const shopId = shopInfo.value?.id
    uni.navigateTo({
      url: `${ClientRoutes.Account.address}?select=1&selectedId=${curAddress.value?.id ?? ''}${edit && curAddress.value ? `&id=${curAddress.value.id}` : ''}`,
      events: {
        addressSelected: (result: unknown) => {
          if (disposed || revision !== getSessionRevision() || shopId !== shopInfo.value?.id || peisongType.value !== 'kd')
            return
          if (!result || typeof result !== 'object' || !('id' in result) || !Number.isSafeInteger(result.id) || Number(result.id) <= 0)
            return
          addressSeq++
          selectedAddressId = Number(result.id)
        },
      },
      success: result => channel = result.eventChannel,
      fail: () => toast('无法打开地址选择，请重试'),
    })
  }

  /** 查看当前结算门店详情，保留结算页。无参数。@returns void。@example goShopDetail() // => 携带当前门店 id 打开详情 */
  function goShopDetail() {
    const id = shopInfo.value?.id
    if (!id)
      return
    void go(ClientRoutes.Ordering.shopDetail, { id })
  }

  function setPackagingFeeUse(v: '1' | '2') {
    packagingFeeUse.value = v
  }

  return {
    shopInfo: shopInfo as Ref<PayShop | null>,
    peisongType,
    curAddress,
    distance,
    addressError,
    addressLoading,
    hasAddresses,
    feeError,
    deliveryIssue,
    availabilityReason,
    packagingFeeUse,
    packagingFee,
    showBothTypes,
    isOutOfRange,
    syncShopAndType,
    selectPeisongType,
    loadPeisongFeeList,
    loadDefaultAddress,
    resolvePeisongFeeId,
    goAddress,
    goShopDetail,
    setPackagingFeeUse,
  }
}

/**
 * DeliveryVm 数据契约；字段可选性及取值范围以声明为准。
 * 值约束：ReturnType<typeof usePayDelivery>。
 * @example
 * import type { DeliveryVm } from '@/pages/ordering/menu-pay/composables/use-delivery'
 * declare const response: DeliveryVm
 * const value: DeliveryVm = response // => 保留 DeliveryVm 的字段与取值约束
 */
export type DeliveryVm = ReturnType<typeof usePayDelivery>
