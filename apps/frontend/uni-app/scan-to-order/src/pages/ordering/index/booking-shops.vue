<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { getCurrentInstance, ref } from 'vue'
import ShopSelectionPage from './components/ShopSelectionPage/index.vue'
import { ClientRoutes } from '@/pages/routes'
import { navigate } from '@/utils/project/navigation'

definePage({ style: { navigationBarTitleText: '选择预约门店', disableScroll: true } })

type PageInstance = ComponentPublicInstance & { getOpenerEventChannel?: () => UniApp.EventChannel }
const page = getCurrentInstance()?.proxy as PageInstance | null | undefined
let change = false
const bookingShopId = ref(0)
onLoad((query) => {
  change = query?.change === '1'
  if (change)
    bookingShopId.value = Number(query?.shopId) || 0
})

function selectShop(shopId: number, shopName: string, shopAddress = '', shopPic = '') {
  if (change) {
    const channel = page?.getOpenerEventChannel?.()
    if (channel) {
      channel.emit('bookingShopSelected', shopId, shopName, shopAddress, shopPic)
      uni.navigateBack()
      return
    }
  }
  void navigate(ClientRoutes.Account.booking, { shopId, shopName, shopAddress, shopPic })
}
</script>

<template>
  <ShopSelectionPage booking :booking-shop-id="bookingShopId" @select-booking-shop="selectShop" />
</template>
