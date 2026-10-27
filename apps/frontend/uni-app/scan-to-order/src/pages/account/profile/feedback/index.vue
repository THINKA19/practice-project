<script lang="ts" setup>
import { useFeedbackPage } from './composables/use-page'

defineOptions({ name: 'MeFeedback' })

definePage({
  style: {
    navigationBarTitleText: '意见反馈',
  },
})

// 装配反馈模块：表单 / 附件上传 / 提交
const { form, demo, picsList, videoUrls, submitting, choosePics, chooseVideo, previewPic, removePic, bindSave } = useFeedbackPage()
</script>

<template>
  <!-- z-paging 接管整页滚动 -->
  <z-paging fixed :auto="false" :hide-empty-view="true" :refresher-enabled="false">
    <!-- 滚动内容区 -->
    <view class="min-h-100vh bg-[linear-gradient(135deg,#FFF5E6_0%,#FFE4D6_50%,#FFD4C4_100%)] px-30rpx pb-40rpx pt-60rpx">
      <!-- 页面头部 -->
      <view class="mb-40rpx text-center">
        <view class="mb-16rpx text-80rpx">
          💭
        </view>
        <view class="mb-12rpx text-48rpx text-[#8B5A3C] font-bold tracking-2rpx">
          听听您的心声
        </view>
        <view class="text-24rpx text-[#A67C52]/90">
          您的每一条建议都是我们前进的动力
        </view>
      </view>

      <view v-if="demo" class="mb-24rpx text-center text-24rpx text-#8B7355">
        开发演示：反馈和附件仅在 Mock 中模拟提交
      </view>

      <!-- 表单卡片：wd-cell-group + wd-cell + wd-input -->
      <view class="relative mb-30rpx overflow-hidden rounded-32rpx bg-[linear-gradient(135deg,#FFFFFF_0%,#FFFBF5_100%)] p-32rpx shadow-[0_12rpx_48rpx_rgba(212,165,116,0.15),0_4rpx_16rpx_rgba(196,149,99,0.08)]">
        <!-- 卡片右上装饰圆 -->
        <view class="absolute h-200rpx w-200rpx rounded-full bg-[linear-gradient(135deg,#FFE4D6_0%,#FFD4C4_100%)] opacity-30 -right-50rpx -top-50rpx" />

        <!-- 姓名：wd-cell 包装 wd-input（wd-input 无 label） -->
        <view class="relative mb-32rpx">
          <view class="mb-20rpx flex items-center pl-8rpx">
            <text class="mr-12rpx text-32rpx">👤</text>
            <text class="text-28rpx text-[#8B5A3C] font-semibold">姓名</text>
          </view>
          <wd-input
            v-model="form.name"
            placeholder="请填写您的姓名"
            clearable
            no-border
            custom-class="!bg-[#FFF9F0] !rounded-16rpx !px-20rpx !py-24rpx !text-28rpx !border-[2rpx_solid_#FFE4D6]"
          />
        </view>

        <!-- 分割线 -->
        <view class="my-32rpx h-1rpx bg-[linear-gradient(90deg,transparent_0%,#FFE4D6_50%,transparent_100%)]" />

        <!-- 手机号：wd-cell 包装 wd-input -->
        <view class="relative mb-32rpx">
          <view class="mb-20rpx flex items-center pl-8rpx">
            <text class="mr-12rpx text-32rpx">📱</text>
            <text class="text-28rpx text-[#8B5A3C] font-semibold">联系电话</text>
          </view>
          <wd-input
            v-model="form.mobile"
            type="number"
            placeholder="请填写手机号（选填）"
            clearable
            no-border
            custom-class="!bg-[#FFF9F0] !rounded-16rpx !px-20rpx !py-24rpx !text-28rpx !border-[2rpx_solid_#FFE4D6]"
          />
        </view>

        <!-- 分割线 -->
        <view class="my-32rpx h-1rpx bg-[linear-gradient(90deg,transparent_0%,#FFE4D6_50%,transparent_100%)]" />

        <!-- 反馈内容：wd-textarea（wd-input 不支持 type="textarea"） -->
        <view class="relative mb-32rpx">
          <view class="mb-20rpx flex items-center pl-8rpx">
            <text class="mr-12rpx text-32rpx">✍️</text>
            <text class="text-28rpx text-[#8B5A3C] font-semibold">反馈内容</text>
          </view>
          <wd-textarea
            v-model="form.content"
            placeholder="请填写您的反馈内容..."
            :auto-height="true"
            clearable
            no-border
            custom-class="!bg-[#FFF9F0] !rounded-16rpx !px-20rpx !py-24rpx !text-28rpx !border-[2rpx_solid_#FFE4D6] !min-h-[200rpx]"
          />
        </view>

        <!-- 图片上传：wd-upload -->
        <view class="relative">
          <view class="mb-20rpx flex items-center pl-8rpx">
            <text class="mr-12rpx text-32rpx">📷</text>
            <text class="text-28rpx text-[#8B5A3C] font-semibold">图片/视频（最多6个）</text>
            <text class="ml-8rpx text-22rpx text-[#C49563]">(选填)</text>
          </view>
          <view class="border-[2rpx_dashed_#FFE4D6] rounded-16rpx bg-[#FFF9F0] p-20rpx">
            <view v-for="(url, index) in picsList" :key="url" class="mb-16rpx">
              <video v-if="videoUrls.includes(url)" :src="url" class="h-240rpx w-full" controls />
              <image v-else :src="url" class="h-160rpx w-160rpx" mode="aspectFill" @tap="previewPic(url)" />
              <button :disabled="submitting" size="mini" @tap="removePic(index)">
                删除
              </button>
            </view>
            <view v-if="picsList.length < 6" class="flex gap-16rpx">
              <button class="attachment-button" :disabled="submitting" size="mini" @tap="choosePics">
                添加图片
              </button>
              <button class="attachment-button" :disabled="submitting" size="mini" @tap="chooseVideo">
                添加视频
              </button>
            </view>
          </view>
        </view>
      </view>

      <!-- 温馨提示卡片：wd-row / wd-col -->
      <view class="mb-40rpx flex items-start border-l-[6rpx_solid_#D4A574] rounded-24rpx bg-[linear-gradient(135deg,#FFF9F0_0%,#FFF5E6_100%)] p-28rpx shadow-[0_8rpx_24rpx_rgba(212,165,116,0.08)]">
        <wd-row :gutter="16">
          <wd-col :span="2">
            <view class="text-36rpx">
              💡
            </view>
          </wd-col>
          <wd-col :span="22">
            <view class="mb-8rpx text-26rpx text-[#8B5A3C] font-semibold">
              温馨提示
            </view>
            <view class="text-22rpx text-[#A67C52] leading-1.6">
              请详细描述遇到的问题，方便工作人员核实和跟进
            </view>
          </wd-col>
        </wd-row>
      </view>
    </view>

    <!-- 底部固定栏：提交按钮，用 #bottom slot 固定在 z-paging 底部 -->
    <template #bottom>
      <view class="bg-white/80 px-30rpx pb-[calc(20rpx+env(safe-area-inset-bottom))] pt-20rpx shadow-[0_-4rpx_24rpx_rgba(160,130,109,0.08)] backdrop-blur-md">
        <wd-button
          block
          size="large"
          custom-class="!h-96rpx !rounded-50rpx !bg-[linear-gradient(135deg,#D4A574_0%,#C49563_100%)] !shadow-[0_16rpx_48rpx_rgba(212,165,116,0.35),0_8rpx_24rpx_rgba(196,149,99,0.2)]"
          :loading="submitting" :disabled="submitting" @click="bindSave"
        >
          提交反馈
        </wd-button>
      </view>
    </template>
  </z-paging>
</template>

<style scoped lang="scss">
.attachment-button {
  flex: 1;
  margin: 0;
  color: #76583e;
  background: #f1e4d3;
  border-radius: 16rpx;

  &::after {
    border: 1rpx solid #d7bea0;
  }
  &[disabled] {
    opacity: 0.5;
  }
}
</style>
