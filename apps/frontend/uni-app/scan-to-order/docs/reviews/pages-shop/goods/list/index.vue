<script lang="ts" setup>
import type { ShopGoodsItem } from './type'
import { useGoodsActions, useGoodsList } from './composables'
import { useMerchantGuard } from '@/utils/auth/guards'

definePage({
  style: {
    navigationBarTitleText: '商品管理',
    navigationBarBackgroundColor: '#E68873',
    navigationBarTextStyle: 'white',
  },
})

// 登录态守卫：未登录 → 登录页，非商家角色 → 客户端首页
useMerchantGuard()

const { keywords, activeCate, categories, list, applyLocalChange } = useGoodsList()
const { goEdit, toggleStatus, adjustStock } = useGoodsActions()

/** 本地回写 mock 数据，保持列表与操作即时一致 */
function onToggle(item: ShopGoodsItem) {
  toggleStatus(item, applyLocalChange)
}
function onAdjustStock(item: ShopGoodsItem) {
  adjustStock(item, applyLocalChange)
}
</script>

<template>
  <view class="min-h-100vh bg-[#F7F2EC] pb-160rpx">
    <!-- 搜索栏 -->
    <view class="sticky top-0 z-10 bg-white px-32rpx py-24rpx shadow-sm">
      <wd-search
        v-model="keywords"
        placeholder="搜索商品名称"
        shape="round"
        background="#FFF5F0"
        custom-class="!rounded-full"
      />
    </view>

    <!-- 分类 Tab -->
    <view class="mt-4rpx bg-white">
      <wd-tabs v-model="activeCate" shape="card" color="#E68873" bg-color="#FFF5F0">
        <wd-tab v-for="c in categories" :key="c.key" :title="c.label" />
      </wd-tabs>
    </view>

    <!-- 统计条 -->
    <view class="mx-24rpx mt-24rpx flex items-center justify-between rounded-24rpx bg-white px-32rpx py-20rpx shadow-sm">
      <view class="text-24rpx text-[#A0826D]">
        共 <text class="text-[#5A3A22] font-semibold">{{ list.length }}</text> 件商品
      </view>
      <view class="flex gap-16rpx">
        <wd-button size="small" plain custom-class="!rounded-32rpx" icon="i-carbon-download">
          批量导出
        </wd-button>
        <wd-button size="small" custom-class="!rounded-32rpx !bg-[#E68873] !text-white" icon="i-carbon-add" @click="goEdit()">
          新增商品
        </wd-button>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="p-24rpx space-y-20rpx">
      <view
        v-for="item in list"
        :key="item.id"
        class="flex gap-24rpx rounded-32rpx bg-white p-24rpx shadow-[0_4rpx_16rpx_rgba(139,90,60,0.06)]"
        @click="goEdit(item.id)"
      >
        <!-- 图 -->
        <view class="relative h-180rpx w-180rpx shrink-0 overflow-hidden rounded-24rpx bg-[linear-gradient(135deg,#FFF5E6,#FFE4D6)]">
          <view class="absolute inset-0 flex items-center justify-center">
            <view class="i-carbon-restaurant h-80rpx w-80rpx text-[#D4A574]" />
          </view>
          <view
            v-if="item.status === 0"
            class="absolute inset-0 flex items-center justify-center bg-black/50 text-26rpx text-white font-bold"
          >
            已下架
          </view>
          <view
            v-else-if="item.stock === 0"
            class="absolute bottom-8rpx left-8rpx right-8rpx rounded-8rpx bg-[#F44336] py-4rpx text-center text-20rpx text-white"
          >
            售罄
          </view>
        </view>

        <!-- 信息 -->
        <view class="flex flex-1 flex-col justify-between">
          <view>
            <view class="flex items-start justify-between">
              <view class="line-clamp-1 text-30rpx text-[#5A3A22] font-semibold">
                {{ item.name }}
              </view>
            </view>
            <view class="mt-8rpx flex items-center gap-12rpx">
              <view class="rounded-12rpx bg-[#FFF5E4] px-12rpx py-4rpx text-20rpx text-[#8B5A3C]">
                {{ item.category }}
              </view>
              <view class="text-22rpx text-[#A0826D]">
                已售 {{ item.sold }}
              </view>
              <view class="text-22rpx text-[#A0826D]">
                库存 {{ item.stock }}
              </view>
            </view>
          </view>

          <view class="flex items-end justify-between">
            <view>
              <view class="text-40rpx text-[#E68873] font-bold">
                ¥{{ item.price }}
              </view>
              <text class="text-22rpx text-[#BDBDBD] line-through">¥{{ item.originPrice }}</text>
            </view>

            <!-- 操作按钮组 -->
            <view class="flex gap-12rpx" @click.stop>
              <wd-button size="mini" plain custom-class="!rounded-24rpx" @click="onAdjustStock(item)">
                改库存
              </wd-button>
              <wd-button
                size="mini"
                custom-class="!rounded-24rpx"
                :class="item.status === 1 ? '!text-[#E68873]' : '!bg-[#4CAF50] !text-white'"
                :plain="item.status === 1"
                @click="onToggle(item)"
              >
                {{ item.status === 1 ? '下架' : '上架' }}
              </wd-button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <fg-empty v-if="list.length === 0" icon="i-carbon-shopping-catalog" text="暂无商品" />

    <!-- 浮动新增按钮 -->
    <view
      class="fixed bottom-40rpx right-32rpx z-20 h-120rpx w-120rpx flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#FF9F7F,#E68873)] text-white shadow-[0_12rpx_32rpx_rgba(230,136,115,0.45)]"
      @click="goEdit()"
    >
      <view class="i-carbon-add h-64rpx w-64rpx" />
    </view>
  </view>
</template>
