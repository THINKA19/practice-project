import { internationalPhone, phoneCountryOf } from '@/utils/project/phone'
import { ClientRoutes } from '@/pages/routes'
import { navigate } from '@/utils/project/navigation'
/** 收货地址管理：多国电话、东南亚配送国家、文字地址与可选地图位置。 */
import { ref } from 'vue'
import type { Address, AddressDraft, AddressForm } from '../models/types'
import { useI18n } from 'vue-i18n'
import { requireIdentity, useSessionAccountScope, useSessionState } from '@/pages/auth/session'
import { addressApi } from './use-requests'
import { checkAddressDraft, defaultAddressFirst, validateAddress } from '../domain/address.rules'

import { alert, chooseLocation, confirm, setTitle, showError, toast } from '@/utils/project/interaction'

function emptyDraft(): AddressDraft {
  return { linkMan: '', mobile: '', address: '', phoneCountry: 'VN', countryCode: '', regionText: '' }
}
/** 拥有地址列表、编辑草稿与保存流程；列表和编辑请求分别编号，换号或销毁后不回写旧数据。 */
export function useAddressPage(onSelect?: (address: Address) => void) {
  const { t } = useI18n()
  const session = useSessionState()

  const addressList = ref<Address[]>([])

  const loaded = ref(false)
  const loading = ref(false)
  const editingLoading = ref(false)
  const selectionMode = ref(false)
  const selectedId = ref('')
  const choosing = ref(false)

  const addressEdit = ref(false)

  const id = ref<number | string | null>(null)

  const addressData = ref<AddressDraft>(emptyDraft())

  const saving = ref(false)
  const locating = ref(false)

  const failed = ref(false)

  let request = 0

  let editRequest = 0

  function resetAddresses() {
    locating.value = false
    selectedId.value = ''
    choosing.value = false
    request++

    editRequest++

    addressList.value = []

    addressData.value = emptyDraft()

    addressEdit.value = false
    loading.value = false
    editingLoading.value = false
    failed.value = false

    loaded.value = false

    saving.value = false
  }
  const scope = useSessionAccountScope(resetAddresses)

  function init(query: {
    id?: string
    select?: string
    selectedId?: string
  } = {}) {
    selectionMode.value = query.select === '1'
    selectedId.value = query.selectedId || ''
    setTitle(t('account.profile.address.title'))

    if (query.id && requireIdentity('customer')) {
      void editAddress(query.id)
    }
  }
  /** 编辑返回列表；列表返回上一页，直接进入时回到首页。 */
  async function goBack() {
    if (saving.value)
      return
    if (addressEdit.value) {
      editCancel()
      return
    }
    const ticket = scope.ticket()
    async function toHome() {
      if (!scope.current(ticket))
        return
      const result = await navigate(ClientRoutes.Home.home)
      if (result.ok === false && scope.current(ticket))
        showError(result.error)
    }
    if (getCurrentPages().length <= 1) {
      await toHome()
      return
    }
    uni.navigateBack({ delta: 1, fail: () => {
      void toHome()
    } })
  }
  /** 页面显示时刷新地址，不覆盖编辑草稿。 */

  async function refresh() {
    // 访客保留新增入口，点击后再引导登录；不请求地址或显示旧账户表单。
    if (!session.hasLogin || session.identity !== 'customer') {
      resetAddresses()
      loaded.value = true
      return
    }
    await initShippingAddress()
  }

  async function initShippingAddress(): Promise<void> {
    const ticket = scope.ticket()

    const generation = ++request

    failed.value = false
    loading.value = true

    try {
      const result = await addressApi.list({ pageSize: 100 })

      if (scope.current(ticket) && generation === request)
        addressList.value = defaultAddressFirst(result)
    }
    catch {
      if (scope.current(ticket) && generation === request)
        failed.value = true
    }
    finally {
      if (scope.current(ticket) && generation === request) {
        loaded.value = true
        loading.value = false
      }
    }
  }

  function addAddress() {
    if (saving.value || loading.value || !requireIdentity('customer'))
      return
    editingLoading.value = false
    locating.value = false
    editRequest++

    addressEdit.value = true

    id.value = null

    addressData.value = emptyDraft()
  }

  function editCancel() {
    if (saving.value)
      return
    editingLoading.value = false
    locating.value = false
    editRequest++

    addressEdit.value = false
  }

  async function editAddress(addressId: number | string) {
    if (saving.value || !requireIdentity('customer'))
      return
    const ticket = scope.ticket()
    locating.value = false

    const generation = ++editRequest

    addressData.value = emptyDraft()

    addressEdit.value = true

    id.value = addressId
    editingLoading.value = true

    try {
      const res = await addressApi.detail(addressId)

      if (!scope.current(ticket) || generation !== editRequest)
        return

      const info = res.info

      addressData.value = {
        linkMan: info.linkMan || '',
        mobile: info.mobile || '',
        phoneCountry: info.phoneCountry || phoneCountryOf(info.mobile || ''),
        countryCode: info.countryCode || '',
        regionText: info.regionText || '',
        address: info.address || '',
        latitude: info.latitude,
        longitude: info.longitude,
        isDefault: info.isDefault,
      }
    }
    catch {
      if (scope.current(ticket) && generation === editRequest) {
        addressEdit.value = false

        void alert(t('account.profile.address.apiError'))
      }
    }
    finally {
      if (scope.current(ticket) && generation === editRequest)
        editingLoading.value = false
    }
  }
  /** 本次使用地址通过页面事件返回，不修改账户默认地址。 */
  async function chooseAddress(addressId: number | string) {
    if (!selectionMode.value || choosing.value || saving.value || loading.value || failed.value || !requireIdentity('customer'))
      return
    const address = addressList.value.find(item => String(item.id) === String(addressId))
    if (!address)
      return
    choosing.value = true
    onSelect?.(address)
    await goBack()
  }

  /** 仅显式“设为默认”操作修改账户默认地址。 */

  async function selectTap(addressId: number | string) {
    if (saving.value || !requireIdentity('customer'))
      return

    const current = addressList.value.find(item => String(item.id) === String(addressId))
    if (current?.isDefault) {
      return
    }
    const ticket = scope.ticket()

    saving.value = true

    try {
      await addressApi.setDefault(addressId)
    }
    catch (error) {
      if (scope.current(ticket))
        showError(error)

      return
    }
    finally {
      if (scope.current(ticket))
        saving.value = false
    }

    if (scope.current(ticket)) {
      request++
      loading.value = false
      addressList.value = defaultAddressFirst(addressList.value.map(item => ({ ...item, isDefault: String(item.id) === String(addressId) })))
      toast('已设为默认地址')
    }
  }

  async function deleteAddress(addressId: number | string) {
    if (saving.value || !requireIdentity('customer'))
      return
    const ticket = scope.ticket()
    saving.value = true
    try {
      const ok = await confirm({
        content: t('account.profile.address.deleteProfile'),
        confirmText: t('common.confirm'),
        cancelText: t('common.cancel'),
      })
      if (!ok || !scope.current(ticket))
        return
      await addressApi.remove(addressId)
      if (scope.current(ticket))
        await initShippingAddress()
    }
    catch (error) {
      if (scope.current(ticket))
        showError(error)
    }
    finally {
      if (scope.current(ticket))
        saving.value = false
    }
  }

  function setField(field: 'linkMan' | 'mobile' | 'address' | 'phoneCountry' | 'countryCode' | 'regionText', value: string) {
    const changedPlace = ['countryCode', 'regionText', 'address'].includes(field) && value !== addressData.value[field]
    addressData.value = { ...addressData.value, [field]: value, ...(changedPlace ? { latitude: undefined, longitude: undefined } : {}), ...(field === 'countryCode' && value !== addressData.value.countryCode ? { regionText: '' } : {}) }
  }

  /** 用户主动确认地图位置后回填坐标；取消、换号或编辑切换不覆盖当前草稿。 */
  async function locateAddress() {
    if (saving.value || locating.value || !addressEdit.value || !requireIdentity('customer'))
      return
    const ticket = scope.ticket()
    const generation = editRequest
    const draft = addressData.value
    locating.value = true
    try {
      const place = await chooseLocation()
      if (!scope.current(ticket) || generation !== editRequest || draft !== addressData.value || !addressEdit.value)
        return
      if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude) || Math.abs(place.latitude) > 90 || Math.abs(place.longitude) > 180 || !(place.address || place.name)?.trim()) {
        toast('请选择具体收货位置')
        return
      }
      addressData.value = { ...draft, address: (place.address || place.name).trim(), latitude: place.latitude, longitude: place.longitude }
    }
    catch (error) {
      if (scope.current(ticket) && generation === editRequest && !String((error as { errMsg?: string })?.errMsg || '').toLowerCase().includes('cancel'))
        toast('定位暂不可用，可重试或继续填写文字地址')
    }
    finally {
      if (scope.current(ticket) && generation === editRequest)
        locating.value = false
    }
  }

  async function bindSave(): Promise<void> {
    if (saving.value || locating.value || editingLoading.value || !requireIdentity('customer')) {
      return
    }

    const d = addressData.value

    const form: AddressForm = {
      linkMan: d.linkMan.trim(),
      mobile: internationalPhone(d.mobile, d.phoneCountry) || d.mobile.trim(),
      phoneCountry: d.phoneCountry,
      countryCode: d.countryCode,
      regionText: d.regionText.trim(),
      address: d.address.trim(),
      latitude: d.latitude,
      longitude: d.longitude,
      isDefault: d.isDefault ?? addressList.value.length === 0,
    }

    const err = validateAddress(form) || checkAddressDraft(form)

    if (err) {
      toast(t(err))

      return
    }

    const ticket = scope.ticket()

    saving.value = true

    try {
      let savedId = id.value
      if (id.value) {
        await addressApi.update({ ...form, id: Number(id.value) })
      }
      else {
        const saved = await addressApi.add(form)
        savedId = saved?.id ?? null
      }

      if (!scope.current(ticket))
        return

      addressEdit.value = false

      await initShippingAddress()
      if (scope.current(ticket) && selectionMode.value && savedId !== null) {
        saving.value = false
        await chooseAddress(savedId)
      }
    }
    catch (e) {
      if (scope.current(ticket))
        showError(e)
    }
    finally {
      if (scope.current(ticket))
        saving.value = false
    }
  }

  return {
    failed,
    loading,
    editingLoading,
    selectionMode,
    selectedId,
    chooseAddress,
    choosing,
    saving,
    locating,
    locateAddress,
    addressList,
    loaded,
    addressEdit,
    addressData,
    init,
    refresh,
    addAddress,
    editCancel,
    editAddress,
    selectTap,
    deleteAddress,
    setField,
    bindSave,
    goBack,
  }
}
