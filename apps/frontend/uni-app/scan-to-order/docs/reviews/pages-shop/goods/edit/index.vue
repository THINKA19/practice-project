<script lang="ts" setup>
import { CATEGORY_OPTIONS, MAX_BANNERS, useGoodsForm, useGoodsMedia, useGoodsMeta } from './composables'
import { useMerchantGuard } from '@/utils/auth/guards'

definePage({
  style: {
    navigationBarTitleText: '商品编辑',
    navigationBarBackgroundColor: '#E68873',
    navigationBarTextStyle: 'white',
  },
})

// 登录态守卫：未登录 → 登录页，非商家角色 → 客户端首页
useMerchantGuard()

const { isEdit, form, cancel, submit } = useGoodsForm()
const { chooseCover, chooseBanners, removeBanner } = useGoodsMedia(form)
const { tagInput, addTag, removeTag, addAttrGroup, removeAttrGroup, addAttrValue, removeAttrValue } = useGoodsMeta(form)
</script>

<template>
  <view class="min-h-100vh bg-[#F7F2EC] pb-200rpx">
    <!-- 封面 & 轮播图 -->
    <view class="bg-white p-32rpx shadow-sm">
      <view class="mb-16rpx text-28rpx text-[#5A3A22] font-semibold">
        商品图片<text class="ml-8rpx text-22rpx text-[#F44336]">*</text>
      </view>
      <view class="flex gap-20rpx">
        <!-- 主图 -->
        <view class="relative">
          <view
            class="h-200rpx w-200rpx flex items-center justify-center overflow-hidden border-2 border-[#E68873] rounded-24rpx border-dashed bg-[#FFF5F0]"
            @click="chooseCover"
          >
            <image v-if="form.cover" :src="form.cover" class="h-full w-full" mode="aspectFill" />
            <view v-else class="flex flex-col items-center text-[#E68873]">
              <view class="i-carbon-camera h-56rpx w-56rpx" />
              <view class="mt-4rpx text-22rpx">
                主图
              </view>
            </view>
          </view>
          <view class="absolute rounded-full bg-[#E68873] px-16rpx py-4rpx text-20rpx text-white -left-8rpx -top-8rpx">
            必填
          </view>
        </view>

        <!-- 横幅图（最多5） -->
        <view v-for="(_, i) in MAX_BANNERS" :key="i" class="relative">
          <view
            class="h-200rpx w-200rpx flex items-center justify-center overflow-hidden border-2 border-[#E0CFBC] rounded-24rpx border-dashed bg-[#FAF3EC]"
            @click="i < form.banners.length ? null : chooseBanners"
          >
            <image v-if="form.banners[i]" :src="form.banners[i]" class="h-full w-full" mode="aspectFill" />
            <view v-else class="flex flex-col items-center text-[#BDBDBD]">
              <view class="i-carbon-add h-56rpx w-56rpx" />
              <view class="mt-4rpx text-22rpx">
                详情图{{ i + 1 }}
              </view>
            </view>
          </view>
          <view
            v-if="form.banners[i]"
            class="absolute h-40rpx w-40rpx flex items-center justify-center rounded-full bg-black/60 text-white -right-12rpx -top-12rpx"
            @click.stop="removeBanner(i)"
          >
            <view class="i-carbon-close h-28rpx w-28rpx" />
          </view>
        </view>
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="mt-24rpx bg-white p-32rpx shadow-sm">
      <view class="mb-24rpx text-28rpx text-[#5A3A22] font-semibold">
        基本信息
      </view>

      <!-- 商品名 -->
      <view class="mb-32rpx">
        <view class="mb-12rpx text-26rpx text-[#5A4A42] font-medium">
          商品名称<text class="ml-8rpx text-[#F44336]">*</text>
        </view>
        <wd-input
          v-model="form.name"
          placeholder="请输入商品名称（不超过20字）"
          maxlength="20"
          shape="round"
          :custom-style="{ background: '#FFF8F1' }"
        />
      </view>

      <!-- 分类 -->
      <view class="mb-32rpx">
        <view class="mb-12rpx text-26rpx text-[#5A4A42] font-medium">
          所属分类<text class="ml-8rpx text-[#F44336]">*</text>
        </view>
        <wd-drop-menu>
          <wd-drop-menu-item v-model="form.category" title="选择分类" :options="CATEGORY_OPTIONS" />
        </wd-drop-menu>
      </view>

      <!-- 售价 & 原价 -->
      <wd-row :gutter="24" class="mb-32rpx">
        <wd-col :span="12">
          <view class="mb-12rpx text-26rpx text-[#5A4A42] font-medium">
            售价<text class="ml-8rpx text-[#F44336]">*</text>
          </view>
          <wd-input
            v-model="form.price"
            type="number"
            placeholder="¥0.00"
            shape="round"
            :custom-style="{ background: '#FFF8F1' }"
          />
        </wd-col>
        <wd-col :span="12">
          <view class="mb-12rpx text-26rpx text-[#5A4A42] font-medium">
            原价
          </view>
          <wd-input
            v-model="form.originPrice"
            type="number"
            placeholder="划线价（可不填）"
            shape="round"
            :custom-style="{ background: '#FFF8F1' }"
          />
        </wd-col>
      </wd-row>

      <!-- 库存 & 已售 -->
      <wd-row :gutter="24" class="mb-32rpx">
        <wd-col :span="12">
          <view class="mb-12rpx text-26rpx text-[#5A4A42] font-medium">
            库存<text class="ml-8rpx text-[#F44336]">*</text>
          </view>
          <wd-input
            v-model="form.stock"
            type="number"
            placeholder="0为售罄"
            shape="round"
            :custom-style="{ background: '#FFF8F1' }"
          />
        </wd-col>
        <wd-col :span="12">
          <view class="mb-12rpx text-26rpx text-[#5A4A42] font-medium">
            已售（只读）
          </view>
          <wd-input
            :model-value="form.sold"
            disabled
            placeholder="0"
            shape="round"
            :custom-style="{ background: '#FAF3EC' }"
          />
        </wd-col>
      </wd-row>

      <!-- 上下架状态 -->
      <view class="flex items-center justify-between border-t border-[#F5EDE3] py-16rpx">
        <view>
          <view class="text-26rpx text-[#5A4A42] font-medium">
            上架状态
          </view>
          <view class="mt-4rpx text-22rpx text-[#A0826D]">
            保存后立即生效
          </view>
        </view>
        <wd-switch v-model="form.status" :active-value="1" :inactive-value="0" active-color="#E68873" />
      </view>
    </view>

    <!-- 商品描述 -->
    <view class="mt-24rpx bg-white p-32rpx shadow-sm">
      <view class="mb-16rpx text-28rpx text-[#5A3A22] font-semibold">
        商品描述
      </view>
      <wd-textarea
        v-model="form.description"
        placeholder="请输入商品描述（不超过200字）"
        maxlength="200"
        :autosize="{ minHeight: 160, maxHeight: 320 }"
        custom-class="!rounded-24rpx"
        :custom-style="{ background: '#FFF8F1', padding: '20rpx' }"
      />
    </view>

    <!-- 标签 -->
    <view class="mt-24rpx bg-white p-32rpx shadow-sm">
      <view class="mb-16rpx text-28rpx text-[#5A3A22] font-semibold">
        商品标签 <text class="ml-8rpx text-22rpx text-[#A0826D] font-normal">（最多5个，用于前台展示，如"热销"、"招牌"）</text>
      </view>
      <view class="mb-20rpx flex flex-wrap gap-16rpx">
        <view
          v-for="(t, i) in form.tags"
          :key="i"
          class="flex items-center gap-8rpx rounded-full bg-[#FFF5E4] px-20rpx py-10rpx text-24rpx text-[#8B5A3C]"
        >
          {{ t }}
          <view class="i-carbon-close h-24rpx w-24rpx" @click="removeTag(i)" />
        </view>
      </view>
      <view class="flex gap-16rpx">
        <wd-input
          v-model="tagInput"
          placeholder="输入标签后点击添加"
          shape="round"
          maxlength="8"
          :custom-style="{ background: '#FFF8F1' }"
          class="flex-1"
          @confirm="addTag"
        />
        <wd-button custom-class="!rounded-32rpx" plain @click="addTag">
          添加
        </wd-button>
      </view>
    </view>

    <!-- 规格属性（可选：如辣度/温度/配料等） -->
    <view class="mt-24rpx bg-white p-32rpx shadow-sm">
      <view class="mb-24rpx flex items-center justify-between">
        <view class="text-28rpx text-[#5A3A22] font-semibold">
          规格属性 <text class="ml-8rpx text-22rpx text-[#A0826D] font-normal">（可选）</text>
        </view>
        <wd-button size="small" icon="i-carbon-add" custom-class="!rounded-32rpx !bg-[#E68873] !text-white" @click="addAttrGroup">
          新增规格
        </wd-button>
      </view>

      <view class="space-y-24rpx">
        <view
          v-for="(g, gi) in form.attrs"
          :key="gi"
          class="border border-[#F0E7DC] rounded-24rpx bg-[#FFFBF8] p-24rpx"
        >
          <view class="mb-20rpx flex items-center justify-between">
            <wd-input
              v-model="g.k"
              placeholder="规格名称，如辣度、温度"
              shape="round"
              size="small"
              :custom-style="{ background: '#FFF8F1' }"
              class="mr-16rpx flex-1"
            />
            <view class="i-carbon-trash-can h-40rpx w-40rpx text-[#F44336]" @click="removeAttrGroup(gi)" />
          </view>

          <view class="mb-16rpx flex items-center">
            <text class="mr-16rpx text-24rpx text-[#8B5A3C]">必选</text>
            <wd-switch v-model="g.required" active-color="#E68873" size="20" />
          </view>

          <view class="mb-16rpx flex flex-wrap gap-12rpx">
            <view
              v-for="(v, vi) in g.list"
              :key="vi"
              class="flex items-center gap-8rpx border border-[#F0E7DC] rounded-full bg-white px-20rpx py-8rpx text-24rpx text-[#5A4A42]"
            >
              <wd-input
                v-model="g.list[vi]"
                size="small"
                placeholder="选项值"
                :border="false"
                custom-class="!p-0"
                style="width: 120rpx"
              />
              <view class="i-carbon-close h-20rpx w-20rpx text-[#A0826D]" @click="removeAttrValue(g, vi)" />
            </view>
            <wd-button size="small" plain custom-class="!rounded-32rpx" icon="i-carbon-add" @click="addAttrValue(g)">
              添加选项
            </wd-button>
          </view>
        </view>

        <view v-if="form.attrs.length === 0" class="border border-[#E0CFBC] rounded-24rpx border-dashed py-48rpx text-center text-26rpx text-[#A0826D]">
          暂未设置规格，如不区分规格可留空
        </view>
      </view>
    </view>

    <!-- 底部保存栏 -->
    <view class="fixed bottom-0 left-0 right-0 z-20 flex gap-16rpx border-t border-[#F0E7DC] bg-white px-32rpx py-24rpx shadow-[0_-4rpx_20rpx_rgba(0,0,0,0.04)]">
      <wd-button size="large" plain block custom-class="!rounded-48rpx" @click="cancel">
        取消
      </wd-button>
      <wd-button block size="large" custom-class="!rounded-48rpx !bg-[#E68873] !text-white" @click="submit">
        {{ isEdit ? '保存修改' : '提交新增' }}
      </wd-button>
    </view>
  </view>
</template>
