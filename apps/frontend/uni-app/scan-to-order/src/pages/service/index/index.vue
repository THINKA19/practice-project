<script setup lang="ts">
import ServiceGalleryGroup from './components/Gallery/index.vue'
import { useServiceView } from './composables/use-view'

defineOptions({ name: 'Service' })
definePage({ style: { navigationBarTitleText: '服务', disableScroll: true } })

const { PageState, ContactDock, t, galleryActions, contacts, groups, loading, failed, loadGallery, setTitle, pageVisible } = useServiceView()
</script>

<template>
  <!-- z-paging 接管整页纵向滚动 -->
  <z-paging fixed :use-page-scroll="false" :auto="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false" :paging-style="{ background: 'linear-gradient(180deg,#ffede8 0%,#fff5f1 50%,#fffaf7 100%)' }">
    <view class="pb-120rpx">
      <!-- 分组图文：标题 + 查看更多 + 横向滚动图 -->
      <view v-if="!loading && !failed" class="w-full">
        <ServiceGalleryGroup v-for="(group, groupIndex) in groups" :key="group.id" :group="group" :group-index="groupIndex" @preview="galleryActions.preview" @more="galleryActions.more" />
      </view>
      <PageState v-if="loading || failed || !groups.length" :status="loading ? 'loading' : failed ? 'error' : 'empty'" :title="t(loading ? 'common.loading' : failed ? 'service.unavailable' : 'service.empty')" :description="!loading && !failed ? t('service.emptyHint') : undefined" />
    </view>
  </z-paging>

  <!-- 右侧固定联系方式：微信（最优先）+ Telegram / WhatsApp / Facebook -->
  <ContactDock :contacts="contacts" :hint="t('service.demo')" />
</template>
