<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】菜单选品 / components/catalog/GoodsList/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import GoodsList from '@/pages/ordering/menu/components/catalog/GoodsList/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import { getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { PageState } from '@/components/page-state'
import type { Goods, GoodsListAction, MenuSection, MiaoshaCountdown } from '../../../models/goods.types'
import type { Banner } from '@/pages/home/index/index'
import { useOrderingLocale as useI18n } from '../../../composables/use-locale'
import { sectionAnchor } from '../../../composables/use-menu'

/**
 * 右侧连续滚动商品列表：Banner + 按分类分段的商品
 * - 定位：父级分类锚点 → 650ms 缓动更新内部 scroll-top
 * - 联动：实测各分段位置，滚动时回传当前可见分段的分类下标
 */
import { BannerCarousel } from '@/components/banner-carousel'
import GoodsCard from './parts/GoodsCard.vue'

const props = defineProps<{
  sections: MenuSection[]
  banners: Banner[]
  countdowns: Record<number, MiaoshaCountdown>
  actions: Record<number, GoodsListAction>
  /** 商品 id → 购物车数量 */
  badges: Record<number, number>
  scrollIntoView: string
  empty: boolean
  loading?: boolean
  failed?: boolean
  addingGoods?: Record<string, boolean>
}>()

const emit = defineEmits<{
  visibleCategory: [categoryIndex: number]
  reachBottom: []
  tapBanner: [banner: Banner]
  open: [goods: Goods]
  add: [goods: Goods]
  detail: [goods: Goods]
  retry: []
}>()

const { t } = useI18n()
const instance = getCurrentInstance()

/** 各分段相对滚动内容顶部的偏移 */
let sectionTops: Array<{ top: number, categoryIndex: number }> = []
let currentScrollTop = 0

function measure() {
  nextTick(() => {
    const query = uni.createSelectorQuery().in(instance?.proxy)
    query.select('.goods-scroll').boundingClientRect()
    query.selectAll('.goods-section').boundingClientRect()
    query.exec((res) => {
      const box = res?.[0] as UniApp.NodeInfo | null
      const list = res?.[1] as UniApp.NodeInfo[] | null
      if (!box || !list) {
        return
      }
      sectionTops = list.map((rect, i) => ({
        top: (rect.top || 0) - (box.top || 0) + currentScrollTop,
        categoryIndex: props.sections[i]?.categoryIndex ?? 0,
      }))
    })
  })
}

watch(() => [props.sections.length, props.banners.length], measure)

function onScroll(e: { detail: { scrollTop: number } }) {
  currentScrollTop = e.detail.scrollTop
  if (!sectionTops.length) {
    return
  }
  const y = currentScrollTop + 10
  let current = sectionTops[0].categoryIndex
  for (const s of sectionTops) {
    if (s.top <= y) {
      current = s.categoryIndex
    }
    else {
      break
    }
  }
  emit('visibleCategory', current)
}

// 通过 scroll-top 驱动内部滚动，统一各端分类切换的时长，不移动外层页面。
const scrollTop = ref(0)
let animationTimer: ReturnType<typeof setTimeout> | undefined
let animationVersion = 0

function stopAnimation() {
  animationVersion++
  if (animationTimer !== undefined) {
    clearTimeout(animationTimer)
    animationTimer = undefined
  }
}

function scrollToCategory(anchor: string) {
  stopAnimation()
  if (!anchor)
    return
  const version = animationVersion
  nextTick(() => {
    const query = uni.createSelectorQuery().in(instance?.proxy)
    query.select('.goods-scroll').boundingClientRect()
    query.select('.goods-content').boundingClientRect()
    query.select(`#${anchor}`).boundingClientRect()
    query.exec((res) => {
      if (version !== animationVersion)
        return
      const [box, content, target] = res as Array<UniApp.NodeInfo | null>
      if (!box || !content || !target)
        return
      const from = currentScrollTop
      const to = Math.max(0, Math.min(from + (target.top || 0) - (box.top || 0), (content.height || 0) - (box.height || 0)))
      const startedAt = Date.now()
      function step() {
        if (version !== animationVersion)
          return
        const progress = Math.min(1, (Date.now() - startedAt) / 650)
        const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
        scrollTop.value = from + (to - from) * eased
        if (progress < 1)
          animationTimer = setTimeout(step, 16)
        else
          animationTimer = undefined
      }
      animationTimer = setTimeout(step, 16)
    })
  })
}

watch(() => props.scrollIntoView, scrollToCategory)
onMounted(measure)
onUnmounted(stopAnimation)
</script>

<template>
  <scroll-view
    class="goods-scroll"
    scroll-y
    :scroll-with-animation="false"
    :scroll-top="scrollTop"
    @touchstart="stopAnimation"
    @wheel="stopAnimation"
    @scroll="onScroll"
    @scrolltolower="emit('reachBottom')"
  >
    <view class="goods-content p-20rpx">
      <BannerCarousel class="banner" :items="banners" height="110rpx" @select="emit('tapBanner', $event)" />
      <PageState v-if="loading && !sections.length" status="loading" :title="t('common.loading')" compact />
      <PageState v-else-if="failed" status="error" :title="t('common.loadFailed')" compact>
        <wd-button size="small" @click="emit('retry')">
          {{ t('common.retry') }}
        </wd-button>
      </PageState>
      <PageState v-else-if="empty" status="empty" :title="t('menuState.empty')" :description="t('menuState.emptyHint')" compact />
      <view v-for="section in sections" :id="sectionAnchor(section.category.id)" :key="section.category.id" class="goods-section">
        <view class="section-title">
          {{ section.category.name }}
        </view>
        <GoodsCard
          v-for="goods in section.goods"
          :key="goods.id"
          :goods="goods"
          :action="actions[goods.id] || 'add'"
          :countdown="countdowns[goods.id] || null"
          :badge="badges[goods.id] || 0"
          :adding="addingGoods?.[goods.id] || false"
          @open="emit('open', $event)"
          @add="emit('add', $event)"
          @detail="emit('detail', $event)"
        />
      </view>
    </view>
  </scroll-view>
</template>

<style lang="scss" scoped>
.goods-scroll {
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100%;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

/* #ifdef H5 */
.goods-scroll :deep(.uni-scroll-view) {
  overscroll-behavior-y: contain;
}
/* #endif */

.banner {
  margin-bottom: 20rpx;
  overflow: hidden;
  border-radius: 16rpx;
}

.section-title {
  padding: 8rpx 0 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #2c2416;
}
</style>
