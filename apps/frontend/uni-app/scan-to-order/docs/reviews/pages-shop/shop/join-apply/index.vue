<script setup lang="ts">
import { useJoinApply, UPLOAD_MAX_COUNT } from './composables'

definePage({
  style: {
    navigationBarTitleText: '商家入驻申请',
  },
})
defineOptions({ name: 'ShopJoinApply' })

// 装配入驻模块：表单 / 附件上传 / 提交
const { form, picsList, bindSave, afterPicRead, afterPicDel } = useJoinApply()

const textareaAutoSize = { minHeight: 100 }
</script>

<template>
  <!-- 外层容器：三色渐变 + 相对定位供装饰气泡定位 -->
  <view
    class="min-h-screen w-screen relative overflow-hidden pb-40rpx bg-[linear-gradient(135deg,#FFF5E6_0%,#FFE4D6_50%,#FFF8F0_100%)]"
  >
    <!-- 顶部装饰气泡 -->
    <view class="pointer-events-none absolute top-0 left-0 right-0 h-400rpx overflow-hidden z-0">
      <view
        class="absolute w-120rpx h-120rpx rounded-full bg-white/30 top-50rpx left-30rpx animate-[float_6s_ease-in-out_infinite]"
      />
      <view
        class="absolute w-180rpx h-180rpx rounded-full bg-white/30 top-150rpx right-40rpx animate-[float_6s_ease-in-out_infinite_2s]"
      />
      <view
        class="absolute w-90rpx h-90rpx rounded-full bg-white/30 top-280rpx left-[50%] animate-[float_6s_ease-in-out_infinite_4s]"
      />
    </view>

    <!-- 欢迎标题区 -->
    <view class="relative z-10 py-60rpx pb-50rpx text-center">
      <view
        class="mb-24rpx inline-flex w-160rpx h-160rpx rounded-full items-center justify-center bg-[linear-gradient(135deg,#FFFFFF_0%,#FFF5E6_100%)] shadow-[0_12rpx_40rpx_rgba(93,58,26,0.12)] animate-[bounce_2s_ease-in-out_infinite]"
      >
        <view class="i-carbon-cafe text-100rpx text-[#C09A6B]" />
      </view>
      <view
        class="text-48rpx font-bold text-[#5D3A1A] mb-16rpx tracking-2rpx drop-shadow-[0_4rpx_12rpx_rgba(93,58,26,0.08)]"
      >
        商家入驻申请
      </view>
      <view class="text-26rpx text-[#8B6F47] opacity-90">
        加入我们，开启您的甜蜜事业
      </view>
    </view>

    <!-- 表单卡片 -->
    <view
      class="relative z-10 mx-30rpx p-40rpx pt-30rpx rounded-32rpx bg-white shadow-[0_8rpx_32rpx_rgba(93,58,26,0.08)] border border-solid border-white"
    >
      <!-- ===== 基本信息 分区 ===== -->
      <view class="mb-50rpx">
        <!-- 分区标题：左右线 + 中间文字 -->
        <view class="flex items-center justify-center gap-20rpx mb-40rpx">
          <view
            class="flex-1 h-2rpx bg-[linear-gradient(90deg,transparent,#D4A574,transparent)] max-w-120rpx"
          />
          <view class="text-30rpx font-semibold text-[#5D3A1A] whitespace-nowrap flex items-center gap-10rpx">
            <view class="i-carbon-user-multiple text-30rpx text-[#C09A6B]" />
            基本信息
          </view>
          <view
            class="flex-1 h-2rpx bg-[linear-gradient(90deg,transparent,#D4A574,transparent)] max-w-120rpx"
          />
        </view>

        <!-- 联系人 -->
        <view class="mb-32rpx">
          <wd-row align="center" :gutter="12" class="mb-16rpx">
            <wd-col :span="18">
              <view class="flex items-center pl-8rpx">
                <view class="w-60rpx h-60rpx rounded-full center bg-[linear-gradient(135deg,#FFF5EB_0%,#FFE8D1_100%)] mr-12rpx">
                  <view class="i-carbon-user text-28rpx text-[#C4823A]" />
                </view>
                <text class="text-28rpx text-[#333333] font-medium">联系人</text>
                <text class="ml-6rpx text-28rpx text-[#FF6B6B]">*</text>
              </view>
            </wd-col>
          </wd-row>
          <wd-input
            v-model="form.name"
            placeholder="请输入联系人姓名"
            clearable
            custom-style="!background:#F8F8F8 !border-radius:16rpx !padding:24rpx !font-size:28rpx"
          />
        </view>

        <!-- 联系电话 -->
        <view>
          <wd-row align="center" :gutter="12" class="mb-16rpx">
            <wd-col :span="18">
              <view class="flex items-center pl-8rpx">
                <view class="w-60rpx h-60rpx rounded-full center bg-[linear-gradient(135deg,#EBF7FF_0%,#D1EEFF_100%)] mr-12rpx">
                  <view class="i-carbon-phone text-28rpx text-[#3A83C4]" />
                </view>
                <text class="text-28rpx text-[#333333] font-medium">联系电话</text>
                <text class="ml-6rpx text-28rpx text-[#FF6B6B]">*</text>
              </view>
            </wd-col>
          </wd-row>
          <!-- 校验支持带区号的座机 / 400 热线（含短横线），用 number 键盘打不出「-」 -->
          <wd-input
            v-model="form.mobile"
            type="text"
            placeholder="请输入联系电话"
            clearable
            custom-style="!background:#F8F8F8 !border-radius:16rpx !padding:24rpx !font-size:28rpx"
          />
        </view>
      </view>

      <!-- ===== 店铺资料 分区 ===== -->
      <view>
        <!-- 分区标题 -->
        <view class="flex items-center justify-center gap-20rpx mb-40rpx">
          <view
            class="flex-1 h-2rpx bg-[linear-gradient(90deg,transparent,#D4A574,transparent)] max-w-120rpx"
          />
          <view class="text-30rpx font-semibold text-[#5D3A1A] whitespace-nowrap flex items-center gap-10rpx">
            <view class="i-carbon-store text-30rpx text-[#C09A6B]" />
            店铺资料
          </view>
          <view
            class="flex-1 h-2rpx bg-[linear-gradient(90deg,transparent,#D4A574,transparent)] max-w-120rpx"
          />
        </view>

        <!-- 店铺照片上传 -->
        <view class="mb-32rpx">
          <wd-row align="center" :gutter="12" class="mb-16rpx">
            <wd-col :span="24">
              <view class="flex items-center pl-8rpx">
                <view class="w-60rpx h-60rpx rounded-full center bg-[linear-gradient(135deg,#F3EDFF_0%,#E3D6FF_100%)] mr-12rpx">
                  <view class="i-carbon-image text-28rpx text-[#8B6BCC]" />
                </view>
                <text class="text-28rpx text-[#333333] font-medium">店铺照片</text>
                <text class="ml-8rpx text-22rpx text-[#999999]">（营业执照、店铺照片等）</text>
              </view>
            </wd-col>
          </wd-row>
          <!-- wd-upload：原生上传；样式自定义 -->
          <view
            class="p-20rpx rounded-16rpx bg-[#FAFAFA] border-2 border-dashed border-[#E0E0E0]"
          >
            <wd-upload
              :file-list="picsList"
              :limit="UPLOAD_MAX_COUNT"
              accept="media"
              multiple
              :auto-upload="false"
              @change="afterPicRead"
              @remove="afterPicDel"
            >
              <view class="center flex-col py-10rpx">
                <view class="i-carbon-camera text-48rpx text-[#8B6F47]" />
                <text class="mt-4rpx text-24rpx text-[#8B6F47]">图片或视频</text>
              </view>
            </wd-upload>
          </view>
        </view>

        <!-- 申请说明 textarea -->
        <view>
          <wd-row align="center" :gutter="12" class="mb-16rpx">
            <wd-col :span="24">
              <view class="flex items-center pl-8rpx">
                <view class="w-60rpx h-60rpx rounded-full center bg-[linear-gradient(135deg,#FFF5EB_0%,#FFE8D1_100%)] mr-12rpx">
                  <view class="i-carbon-edit text-28rpx text-[#C4823A]" />
                </view>
                <text class="text-28rpx text-[#333333] font-medium">申请说明</text>
                <text class="ml-6rpx text-28rpx text-[#FF6B6B]">*</text>
              </view>
            </wd-col>
          </wd-row>
          <wd-textarea
            v-model="form.content"
            placeholder="请简要描述您的店铺情况、经营品类等信息..."
            :autosize="textareaAutoSize"
            custom-style="!background:#F8F8F8 !border-radius:16rpx !padding:24rpx !font-size:28rpx !border:none !outline:none"
          />
        </view>
      </view>

      <!-- ===== 温馨提示 ===== -->
      <view
        class="mt-40rpx p-30rpx rounded-20rpx bg-[linear-gradient(135deg,#FFF9F0_0%,#FFF5E6_100%)] border-l-6rpx border-solid border-l-[#D4A574]"
      >
        <view class="mb-20rpx flex items-center text-28rpx font-semibold text-[#5D3A1A]">
          <view class="i-carbon-idea text-28rpx text-[#D4A574] mr-10rpx" />
          温馨提示
        </view>
        <view
          v-for="(tip, i) in [
            '请确保提供的信息真实有效',
            '我们将在1-3个工作日内审核您的申请',
            '审核结果将通过短信或站内消息通知',
          ]"
          :key="i"
          class="text-24rpx text-[#666666] leading-40rpx mb-8rpx last:mb-0 pl-8rpx"
        >
          • {{ tip }}
        </view>
      </view>
    </view>

    <!-- ===== 提交按钮 ===== -->
    <view class="relative z-10 mx-30rpx my-50rpx">
      <wd-button
        block
        size="large"
        custom-class="!h-96rpx !rounded-48rpx !bg-[linear-gradient(135deg,#D4A574_0%,#A67C52_100%)] !text-white !text-32rpx !font-semibold tracking-4rpx !shadow-[0_8rpx_24rpx_rgba(164,124,82,0.3)] !border-none"
        @click="bindSave"
      >
        提交申请
      </wd-button>
    </view>

    <!-- ===== 底部装饰 ===== -->
    <view class="relative z-10 text-center mt-40rpx px-30rpx">
      <view class="text-24rpx text-[#8B6F47] opacity-70">
        期待与您携手共创美好未来
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
/* 关键帧动画：仅保留 bubble float 与 icon bounce 两类 UnoCSS animate-[xxx] 需要复用的规则 */
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
  50%      { transform: translateY(-30rpx) scale(1.1); opacity: 0.8; }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10rpx); }
}

/* wd-upload 样式微调（使其在虚线容器内适配并匹配金色主题）*/
:deep(.wot-design-uni) {
  .wd-upload__evoke {
    background: var(--app-white) !important;
    border: 2rpx dashed var(--app-brand-gold) !important;
    border-radius: 12rpx !important;
  }
  .wd-upload__picture,
  .wd-upload__video {
    border-radius: 12rpx !important;
  }
}
</style>
