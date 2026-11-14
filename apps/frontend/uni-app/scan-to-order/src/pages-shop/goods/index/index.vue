<script lang="ts" setup>
import FgPrice from '@/components/fg-price/fg-price.vue'
import { t } from '@/locale'
import { shopText as st } from '@/locale/shop-text'
import { computed, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useGoodsActions } from './composables/index/useGoodsActions'
import { useGoodsList } from './composables/index/useGoodsList'
import { merchantCurrency, useMerchantPage, useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { useMerchantNoticeLifecycle } from '@/pages-shop/shop/index'

definePage({
  style: {
    disableScroll: true,
    navigationBarTitleText: '商品管理',
  },
})

// 登录态守卫：未登录 → 登录页，非商家角色 → 客户端首页
useMerchantNoticeLifecycle(useMerchantPage())
const context = useMerchantShopStore()

const { activeCate, categories, list, applyLocalChange } = useGoodsList()
// 分类异步更新或翻译变化后，重新初始化 Tabs 的指示线位置。
const categoryTabsKey = computed(() => JSON.stringify(categories.value.map(c => [c.key, st(c.label)])))
const { editor, editorOpen, input, saving, openEditor, submitEditor, markSoldOut } = useGoodsActions()
const paging = ref<{ scrollToTop: (animated: boolean) => void } | null>(null)

watch([activeCate, () => context.revision], () => paging.value?.scrollToTop(false))

onShow(() => uni.setNavigationBarTitle({ title: t('shop.messages.products') }))
watch(() => t('shop.messages.products'), title => uni.setNavigationBarTitle({ title }))
</script>

<template>
  <z-paging
    ref="paging"
    :fixed="true"
    layout-only
    safe-area-inset-bottom
    :use-page-scroll="false"
    :paging-style="{ background: '#f5f7f6' }"
  >
    <template #top>
      <view class="bg-[#f5f7f6] pb-12rpx">
        <!-- 分类 Tab -->
        <view class="mt-4rpx bg-white" style="--wot-tabs-nav-bg: #fff; --wot-tabs-nav-line-bg: #6b503c;">
          <wd-tabs :key="categoryTabsKey" v-model="activeCate" color="#6b503c">
            <wd-tab v-for="c in categories" :key="c.key" :title="st(c.label)" />
          </wd-tabs>
        </view>

        <!-- 统计条 -->
        <view class="mx-24rpx mt-12rpx flex items-center justify-between rounded-24rpx bg-white px-32rpx py-20rpx shadow-sm">
          <view class="text-24rpx text-[#237a50]">
            {{ st('共') }} <text class="text-[#17392a] font-semibold">{{ st(list.length) }}</text> {{ st('件商品') }}
          </view>
        </view>
      </view>
    </template>

    <!-- 商品列表 -->
    <view class="px-24rpx pb-24rpx pt-12rpx space-y-20rpx">
      <view
        v-for="item in list"
        :key="item.id"
        class="flex flex-wrap items-center gap-16rpx rounded-32rpx bg-white p-24rpx shadow-[0_4rpx_16rpx_rgba(139,90,60,0.06)]"
      >
        <!-- 图 -->
        <view class="relative h-144rpx w-144rpx shrink-0 overflow-hidden rounded-24rpx bg-[linear-gradient(135deg,#FFF5E6,#FFE4D6)]">
          <image v-if="item.cover" :src="item.cover" class="h-full w-full" mode="aspectFill" />
          <view v-else class="absolute inset-0 flex items-center justify-center">
            <view class="i-carbon-restaurant h-80rpx w-80rpx text-[#D4A574]" />
          </view>
          <view
            v-if="item.stock === 0"
            class="absolute inset-0 flex items-center justify-center bg-[#4b4b4b]/75 text-32rpx text-white font-bold"
          >
            {{ st('售罄') }}
          </view>
        </view>

        <!-- 信息 -->
        <view class="min-w-0 flex flex-1 flex-col justify-between">
          <view>
            <view class="flex items-start justify-between">
              <view class="line-clamp-1 text-30rpx text-[#17392a] font-semibold">
                {{ st(item.name) }}
              </view>
            </view>
            <view class="mt-8rpx flex flex-wrap items-center gap-8rpx">
              <view class="rounded-12rpx bg-[#FFF5E4] px-12rpx py-4rpx text-20rpx text-[#8B5A3C]">
                {{ st(item.category) }}
              </view>
              <view class="text-22rpx text-[#237a50]">
                已售 {{ st(item.sold) }}
              </view>
              <view class="text-22rpx text-[#237a50]">
                {{ st('库存') }} {{ st(item.stock) }}
              </view>
            </view>
          </view>

          <view class="mt-12rpx">
            <view>
              <view class="text-40rpx text-[#c93636] font-bold">
                <FgPrice :amount="item.price" :currency-code="merchantCurrency(context.current)" amount-unit="settlement" />
              </view>
              <text v-if="item.originPrice > item.price" class="text-24rpx text-[#8b7355] line-through"><FgPrice :amount="item.originPrice" :currency-code="merchantCurrency(context.current)" amount-unit="settlement" /></text>
            </view>
          </view>
        </view>

        <!-- 操作按钮组 -->
        <view class="w-full flex items-center justify-end gap-8rpx">
          <wd-button size="mini" plain @click="openEditor(item, 'price')">
            {{ st('改价格') }}
          </wd-button>
          <wd-button v-if="item.stock > 0" size="mini" plain @click="markSoldOut(item, applyLocalChange)">
            {{ st('标记售罄') }}
          </wd-button>
          <wd-button v-else size="mini" custom-class="!bg-[#16834a] !text-white" :disabled="saving" @click="openEditor(item, 'stock')">
            恢复销售
          </wd-button>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <fg-empty v-if="list.length === 0" icon="i-carbon-shopping-catalog" :text="st('暂无商品')" />
  </z-paging>

  <wd-popup v-model="editorOpen" position="center" round :close-on-click-modal="!saving" :style="{ width: '85%' }">
    <view v-if="editor" class="p-32rpx">
      <view class="mb-24rpx text-center text-32rpx font-semibold">
        {{ editor.field === 'price' ? st('改价格') : '恢复销售' }}
      </view>
      <wd-input
        :key="editor.field"
        v-model="input"
        :type="editor.field === 'price' ? 'digit' : 'number'"
        :label="editor.field === 'price' ? st('售价') : '补货数量'"
        :disabled="saving"
        @confirm="submitEditor(applyLocalChange)"
      />
      <view class="mt-24rpx flex justify-end gap-16rpx">
        <wd-button plain :disabled="saving" @click="editorOpen = false">
          {{ st('取消') }}
        </wd-button>
        <wd-button :loading="saving" :disabled="saving" @click="submitEditor(applyLocalChange)">
          {{ st('保存修改') }}
        </wd-button>
      </view>
    </view>
  </wd-popup>
</template>
