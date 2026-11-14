<script lang="ts" setup>
import { useShopMedia, useShopSettings, useShopSubPages } from './composables'
import { useMerchantGuard } from '@/utils/auth/guards'

definePage({
  style: {
    navigationBarTitleText: '店铺设置',
    navigationBarBackgroundColor: '#E68873',
    navigationBarTextStyle: 'white',
  },
})

// 登录态守卫：未登录 → 登录页，非商家角色 → 客户端首页
useMerchantGuard()

const { form, cancel, save } = useShopSettings()
const { chooseLogo, chooseShopPhoto, chooseLocation } = useShopMedia(form)
const { goPage } = useShopSubPages()
</script>

<template>
  <view class="min-h-100vh bg-[#F7F2EC] pb-200rpx">
    <!-- 营业状态快捷开关 -->
    <view
      class="mx-24rpx mt-24rpx flex items-center justify-between rounded-32rpx p-32rpx shadow"
      :class="form.businessStatus
        ? 'bg-[linear-gradient(135deg,#4CAF50,#388E3C)] text-white'
        : 'bg-[linear-gradient(135deg,#9E9E9E,#757575)] text-white'"
    >
      <view>
        <view class="mb-8rpx text-30rpx font-bold">
          {{ form.businessStatus ? '🟢 营业中' : '🔴 已打烊' }}
        </view>
        <view class="text-24rpx opacity-90">
          {{ form.businessStatus ? '顾客可正常下单点餐' : '前台新单入口将关闭' }}
        </view>
      </view>
      <view class="scale-125">
        <wd-switch
          v-model="form.businessStatus"
          active-color="rgba(255,255,255,0.4)"
          inactive-color="rgba(255,255,255,0.4)"
        />
      </view>
    </view>

    <!-- 店铺基本信息 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="mb-24rpx text-28rpx text-[#5A3A22] font-semibold">
        店铺资料
      </view>

      <!-- Logo & 门头照 -->
      <view class="mb-32rpx flex gap-24rpx">
        <view class="flex-1 text-center">
          <view
            class="mb-12rpx h-200rpx flex items-center justify-center border-2 border-[#E0CFBC] rounded-24rpx border-dashed bg-[#FAF3EC]"
            @click="chooseLogo"
          >
            <image v-if="form.shopLogo" :src="form.shopLogo" class="h-full w-full rounded-24rpx" mode="aspectFill" />
            <view v-else class="flex flex-col items-center text-[#BDBDBD]">
              <view class="i-carbon-camera h-56rpx w-56rpx" />
              <view class="mt-8rpx text-22rpx">
                店铺Logo
              </view>
            </view>
          </view>
          <view class="text-22rpx text-[#A0826D]">
            点击上传Logo
          </view>
        </view>
        <view class="flex-1 text-center">
          <view
            class="mb-12rpx h-200rpx flex items-center justify-center border-2 border-[#E0CFBC] rounded-24rpx border-dashed bg-[#FAF3EC]"
            @click="chooseShopPhoto"
          >
            <image v-if="form.shopPhoto" :src="form.shopPhoto" class="h-full w-full rounded-24rpx" mode="aspectFill" />
            <view v-else class="flex flex-col items-center text-[#BDBDBD]">
              <view class="i-carbon-image h-56rpx w-56rpx" />
              <view class="mt-8rpx text-22rpx">
                门头照片
              </view>
            </view>
          </view>
          <view class="text-22rpx text-[#A0826D]">
            点击上传门头照
          </view>
        </view>
      </view>

      <!-- 店铺名 -->
      <view class="mb-24rpx">
        <view class="mb-12rpx text-26rpx text-[#5A4A42] font-medium">
          店铺名称 <text class="text-[#F44336]">*</text>
        </view>
        <wd-input v-model="form.shopName" placeholder="请输入店铺名称" shape="round" :custom-style="{ background: '#FFF8F1' }" />
      </view>

      <!-- 业态 & 联系方式 -->
      <wd-row :gutter="24" class="mb-24rpx">
        <wd-col :span="12">
          <view class="mb-12rpx text-26rpx text-[#5A4A42] font-medium">
            经营业态
          </view>
          <wd-input v-model="form.shopType" placeholder="如：快餐/小吃" shape="round" :custom-style="{ background: '#FFF8F1' }" />
        </wd-col>
        <wd-col :span="12">
          <view class="mb-12rpx text-26rpx text-[#5A4A42] font-medium">
            联系电话 <text class="text-[#F44336]">*</text>
          </view>
          <wd-input v-model="form.contact" type="text" placeholder="手机号/座机" shape="round" :custom-style="{ background: '#FFF8F1' }" />
        </wd-col>
      </wd-row>

      <!-- 地址 -->
      <view class="mb-24rpx">
        <view class="mb-12rpx flex items-center justify-between">
          <text class="text-26rpx text-[#5A4A42] font-medium">店铺地址 <text class="text-[#F44336]">*</text></text>
          <view class="text-24rpx text-[#E68873]" @click="chooseLocation">
            <text class="i-carbon-location mr-8rpx align-middle" />地图选点
          </view>
        </view>
        <wd-textarea
          v-model="form.address"
          placeholder="请填写详细地址"
          :autosize="{ minHeight: 100, maxHeight: 200 }"
          :custom-style="{ background: '#FFF8F1', padding: '20rpx' }"
          custom-class="!rounded-24rpx"
        />
      </view>

      <!-- 店铺简介 -->
      <view>
        <view class="mb-12rpx text-26rpx text-[#5A4A42] font-medium">
          店铺简介
        </view>
        <wd-textarea
          v-model="form.description"
          maxlength="200"
          placeholder="介绍您的店铺特色（不超过200字）"
          :autosize="{ minHeight: 140, maxHeight: 240 }"
          :custom-style="{ background: '#FFF8F1', padding: '20rpx' }"
          custom-class="!rounded-24rpx"
        />
      </view>
    </view>

    <!-- 营业时间 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="mb-24rpx flex items-center justify-between">
        <text class="text-28rpx text-[#5A3A22] font-semibold">营业时间</text>
        <wd-button size="small" plain custom-class="!rounded-32rpx" @click="goPage('添加时段')">
          + 添加时段
        </wd-button>
      </view>
      <view class="space-y-20rpx">
        <view
          v-for="(h, i) in form.businessHours"
          :key="i"
          class="flex items-center rounded-24rpx bg-[#FFFBF8] p-24rpx"
        >
          <wd-switch v-model="h.on" active-color="#E68873" size="20" class="mr-24rpx" />
          <view class="w-200rpx text-26rpx text-[#5A3A22] font-medium">
            {{ h.day }}
          </view>
          <wd-input
            v-model="h.open"
            type="text"
            size="small"
            shape="round"
            placeholder="HH:mm"
            class="w-160rpx"
            :custom-style="{ background: 'white', textAlign: 'center' }"
          />
          <view class="mx-16rpx text-[#A0826D]">
            至
          </view>
          <wd-input
            v-model="h.close"
            type="text"
            size="small"
            shape="round"
            placeholder="HH:mm"
            class="w-160rpx"
            :custom-style="{ background: 'white', textAlign: 'center' }"
          />
        </view>
      </view>
    </view>

    <!-- 服务方式 & 配送 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="mb-24rpx text-28rpx text-[#5A3A22] font-semibold">
        服务方式 & 配送
      </view>

      <view class="grid grid-cols-3 mb-24rpx gap-20rpx">
        <view class="border rounded-24rpx p-24rpx text-center" :class="form.dineIn ? 'border-[#E68873] bg-[#FFF5F0] text-[#E68873]' : 'border-[#E0CFBC] bg-white text-[#A0826D]'" @click="form.dineIn = !form.dineIn">
          <view class="i-carbon-restaurant mx-auto mb-12rpx h-48rpx w-48rpx" />
          <view class="text-24rpx font-medium">
            堂食扫码
          </view>
        </view>
        <view class="border rounded-24rpx p-24rpx text-center" :class="form.takeAway ? 'border-[#E68873] bg-[#FFF5F0] text-[#E68873]' : 'border-[#E0CFBC] bg-white text-[#A0826D]'" @click="form.takeAway = !form.takeAway">
          <view class="i-carbon-shopping-bag mx-auto mb-12rpx h-48rpx w-48rpx" />
          <view class="text-24rpx font-medium">
            到店取餐
          </view>
        </view>
        <view class="border rounded-24rpx p-24rpx text-center" :class="form.delivery ? 'border-[#E68873] bg-[#FFF5F0] text-[#E68873]' : 'border-[#E0CFBC] bg-white text-[#A0826D]'" @click="form.delivery = !form.delivery">
          <view class="i-carbon-delivery mx-auto mb-12rpx h-48rpx w-48rpx" />
          <view class="text-24rpx font-medium">
            外卖配送
          </view>
        </view>
      </view>

      <view v-if="form.delivery" class="rounded-24rpx bg-[#FFF8F1] p-24rpx space-y-20rpx">
        <view class="flex items-center justify-between text-26rpx">
          <text class="text-[#5A4A42]">起送金额</text>
          <wd-input
            v-model="form.minOrderAmount"
            type="number"
            size="small"
            shape="round"
            suffix="元"
            class="w-240rpx"
            :custom-style="{ background: 'white' }"
          />
        </view>
        <view class="flex items-center justify-between text-26rpx">
          <text class="text-[#5A4A42]">配送费</text>
          <wd-input
            v-model="form.deliveryFee"
            type="number"
            size="small"
            shape="round"
            suffix="元"
            class="w-240rpx"
            :custom-style="{ background: 'white' }"
          />
        </view>
        <view class="flex items-center justify-between text-26rpx">
          <text class="text-[#5A4A42]">满额免配送</text>
          <wd-input
            v-model="form.freeDeliveryThreshold"
            type="number"
            size="small"
            shape="round"
            suffix="元"
            class="w-240rpx"
            :custom-style="{ background: 'white' }"
          />
        </view>
        <view class="flex items-center justify-between text-26rpx">
          <text class="text-[#5A4A42]">配送范围</text>
          <wd-input
            v-model="form.deliveryRadius"
            type="number"
            size="small"
            shape="round"
            suffix="km"
            class="w-240rpx"
            :custom-style="{ background: 'white' }"
          />
        </view>
      </view>
    </view>

    <!-- 店铺公告 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="mb-16rpx text-28rpx text-[#5A3A22] font-semibold">
        店铺公告
      </view>
      <view class="mb-12rpx text-22rpx text-[#A0826D]">
        展示在小程序客户端首页顶部
      </view>
      <wd-textarea
        v-model="form.notice"
        maxlength="100"
        placeholder="请输入公告内容（不超过100字）"
        :autosize="{ minHeight: 120, maxHeight: 200 }"
        :custom-style="{ background: '#FFF8F1', padding: '20rpx' }"
        custom-class="!rounded-24rpx"
      />
    </view>

    <!-- 订单设置 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="mb-16rpx text-28rpx text-[#5A3A22] font-semibold">
        订单 / 打印设置
      </view>
      <view class="flex items-center justify-between border-b border-[#F5EDE3] py-20rpx">
        <view>
          <view class="text-26rpx text-[#5A4A42] font-medium">
            新订单自动接单
          </view>
          <view class="text-22rpx text-[#A0826D]">
            开启后无需手动点击"接单"
          </view>
        </view>
        <wd-switch v-model="form.autoReceive" active-color="#E68873" />
      </view>
      <view class="flex items-center justify-between border-b border-[#F5EDE3] py-20rpx">
        <view>
          <view class="text-26rpx text-[#5A4A42] font-medium">
            新单自动打印小票
          </view>
          <view class="text-22rpx text-[#A0826D]">
            需连接打印机设备
          </view>
        </view>
        <wd-switch v-model="form.autoPrint" active-color="#E68873" />
      </view>
      <view class="flex items-center justify-between py-20rpx">
        <view>
          <view class="text-26rpx text-[#5A4A42] font-medium">
            订单语音播报
          </view>
          <view class="text-22rpx text-[#A0826D]">
            新订单/取消订单/催单时提醒
          </view>
        </view>
        <wd-switch v-model="form.soundNotify" active-color="#E68873" />
      </view>
    </view>

    <!-- 账号 & 安全 设置入口 -->
    <view class="mx-24rpx mt-24rpx overflow-hidden rounded-32rpx bg-white shadow-sm">
      <view class="flex items-center justify-between border-b border-[#F5EDE3] p-32rpx" @click="goPage('员工管理')">
        <view class="flex items-center">
          <view class="i-carbon-user-role mr-24rpx h-48rpx w-48rpx text-[#2196F3]" />
          <view>
            <view class="text-28rpx text-[#5A3A22] font-medium">
              员工与权限
            </view>
            <view class="text-22rpx text-[#A0826D]">
              收银员/厨师/店长 账号分配
            </view>
          </view>
        </view>
        <view class="i-carbon-chevron-right h-40rpx w-40rpx text-[#BDBDBD]" />
      </view>
      <view class="flex items-center justify-between border-b border-[#F5EDE3] p-32rpx" @click="goPage('修改密码')">
        <view class="flex items-center">
          <view class="i-carbon-security mr-24rpx h-48rpx w-48rpx text-[#4CAF50]" />
          <view>
            <view class="text-28rpx text-[#5A3A22] font-medium">
              账号安全
            </view>
            <view class="text-22rpx text-[#A0826D]">
              修改登录密码、绑定手机号
            </view>
          </view>
        </view>
        <view class="i-carbon-chevron-right h-40rpx w-40rpx text-[#BDBDBD]" />
      </view>
      <view class="flex items-center justify-between border-b border-[#F5EDE3] p-32rpx" @click="goPage('打印配置')">
        <view class="flex items-center">
          <view class="i-carbon-printer mr-24rpx h-48rpx w-48rpx text-[#FF9800]" />
          <view>
            <view class="text-28rpx text-[#5A3A22] font-medium">
              打印机配置
            </view>
            <view class="text-22rpx text-[#A0826D]">
              连接后厨/前台小票打印机
            </view>
          </view>
        </view>
        <view class="i-carbon-chevron-right h-40rpx w-40rpx text-[#BDBDBD]" />
      </view>
      <view class="flex items-center justify-between p-32rpx" @click="goPage('数据备份')">
        <view class="flex items-center">
          <view class="i-carbon-data-base mr-24rpx h-48rpx w-48rpx text-[#9C27B0]" />
          <view>
            <view class="text-28rpx text-[#5A3A22] font-medium">
              数据备份
            </view>
            <view class="text-22rpx text-[#A0826D]">
              导出订单/商品/营收Excel
            </view>
          </view>
        </view>
        <view class="i-carbon-chevron-right h-40rpx w-40rpx text-[#BDBDBD]" />
      </view>
    </view>

    <!-- 底部保存栏 -->
    <view class="fixed bottom-0 left-0 right-0 z-20 flex gap-16rpx border-t border-[#F0E7DC] bg-white px-32rpx py-24rpx shadow-[0_-4rpx_20rpx_rgba(0,0,0,0.04)]">
      <wd-button size="large" plain block custom-class="!rounded-48rpx" @click="cancel">
        返回
      </wd-button>
      <wd-button block size="large" custom-class="!rounded-48rpx !bg-[#E68873] !text-white" @click="save">
        保存设置
      </wd-button>
    </view>
  </view>
</template>
