<script setup lang="ts">
import ServiceGalleryGroup from './components/ServiceGalleryGroup.vue'
import { ContactDock } from '@/components/contact-dock'
import { useServiceContacts } from './composables/useServiceContacts'
import { currentLocale, t } from '@/locale'
import { ref, watch } from 'vue'
import { useActivityGallery } from './composables/useActivityGallery'

defineOptions({ name: 'Service' })
definePage({ style: { navigationBarTitleText: '服务', disableScroll: true } })
const contacts = useServiceContacts()
const { groups, loading, loadGallery } = useActivityGallery()
onLoad(loadGallery)
function setTitle() {
  uni.setNavigationBarTitle({ title: t('service.title') })
}
const pageVisible = ref(false)
onShow(() => {
  pageVisible.value = true
  setTitle()
})
onHide(() => {
  pageVisible.value = false
})
watch(currentLocale, () => {
  if (pageVisible.value)
    setTitle()
})
</script>

<template>
  <!-- z-paging 接管整页纵向滚动 -->
  <z-paging fixed :use-page-scroll="false" :auto="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false" :paging-style="{ background: 'linear-gradient(180deg,#ffede8 0%,#fff5f1 50%,#fffaf7 100%)' }">
    <view class="pb-120rpx">
      <!-- 分组图文：标题 + 查看更多 + 横向滚动图 -->
      <view class="w-full">
        <ServiceGalleryGroup v-for="(group, groupIndex) in groups" :key="group.id" :group="group" :group-index="groupIndex" />
      </view>
      <!-- 空态：接口返回空列表时兜底（加载中不显示，避免与 loading 文案打架） -->
      <view v-if="!loading && !groups.length" class="mt-200rpx flex flex-col items-center">
        <text class="text-28rpx text-[#999999]">
          {{ t('service.empty') }}
        </text>
      </view>
    </view>
  </z-paging>

  <!-- 右侧固定联系方式：微信（最优先）+ Telegram / WhatsApp / Facebook -->
  <ContactDock :contacts="contacts" :hint="t('service.demo')" />
</template>
