<script setup lang="ts">
import FgPrice from '@/components/fg-price/fg-price.vue'
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】菜单选品 / components/selection/PingtuanPopup/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import PingtuanPopup from '@/pages/ordering/menu/components/selection/PingtuanPopup/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import type { Goods } from '../../../models/goods.types'
import { useOrderingLocale as useI18n } from '../../../composables/use-locale'

/**
 * 拼团弹层：商品与拼团价、成团人数、参团头像、原价购买 / 一起拼 / 重新开团、拼单流程
 */

defineProps<{
  show: boolean
  goods: Goods | null
  /** 成团人数 */
  numberOrder: number
  /** 还差人数 */
  remain: number
  avatars: string[]
}>()

const emit = defineEmits<{
  close: []
  buyOriginal: []
  startGroup: []
  reopen: []
}>()

const { countryCode } = useOrderingCurrency()

const { t } = useI18n()

const steps = [
  { icon: '/static/images/pay-pingtuan.png', key: 'index.step1' },
  { icon: '/static/images/friend.png', key: 'index.step2' },
  { icon: '/static/images/quhuo.png', key: 'index.step3' },
  { icon: '/static/images/tuikuan.png', key: 'index.step4' },
]
</script>

<template>
  <wd-popup
    :model-value="show"
    position="bottom"
    closable
    :z-index="1000"
    custom-style="max-height: 80vh; border-radius: 32rpx 32rpx 0 0; overflow-y: auto;"
    @close="emit('close')"
  >
    <view v-if="goods" class="pingtuan-bar">
      <image class="photo" :src="goods.pic" mode="aspectFill" />
      <view class="ml-28rpx min-w-0 flex-1">
        <view class="title">
          {{ goods.name }}
        </view>
        <view class="mt-16rpx flex items-center">
          <view class="xianjia">
            <FgPrice :amount="goods.pingtuanPrice" :country-code="countryCode" show-currency-name />
          </view>
          <view v-if="goods.minPrice > 0 && goods.minPrice !== goods.pingtuanPrice" class="yuanjia">
            {{ t('goodsDetail.originalPrice') }} <FgPrice :amount="goods.minPrice" :country-code="countryCode" show-currency-name />
          </view>
        </view>
        <view class="jilu">
          {{ numberOrder }}{{ t('index.p_persion') }} / {{ t('index.p_numsuc') }}{{ goods.numberSells }}
        </view>
      </view>
    </view>
    <view class="pingdan-title">
      <template v-if="remain > 0">
        {{ t('index.remain') }}{{ remain }}{{ t('index.remainToSuccess') }}
      </template>
      <template v-else>
        {{ t('index.pingSuccess') }}
      </template>
    </view>
    <view class="avatars">
      <image v-for="(src, i) in avatars" :key="i" class="avatar" :src="src" mode="aspectFill" />
    </view>
    <view class="buttons">
      <wd-button round variant="plain" @click="emit('buyOriginal')">
        {{ t('index.originalPriceBuy') }}
      </wd-button>
      <wd-button v-if="remain > 0" round type="primary" @click="emit('startGroup')">
        {{ t('index.pingtuan') }}
      </wd-button>
      <wd-button v-else round type="primary" @click="emit('reopen')">
        {{ t('index.openNewPingtuan') }}
      </wd-button>
    </view>
    <wd-divider dashed>
      {{ t('index.pingtuanProcess') }}
    </wd-divider>
    <view class="liucheng">
      <view v-for="s in steps" :key="s.key" class="step">
        <image class="icon" :src="s.icon" mode="aspectFill" />
        <view class="content">
          {{ t(s.key) }}
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
.pingtuan-bar {
  display: flex;
  align-items: center;
  padding: 32rpx;
  margin: 40rpx 32rpx;
  background: linear-gradient(135deg, #faf8f5 0%, #fff 100%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);

  .photo {
    flex-shrink: 0;
    width: 160rpx;
    height: 160rpx;
    border: 6rpx solid #fff;
    border-radius: 20rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  }

  .title {
    font-size: 32rpx;
    font-weight: 600;
    line-height: 1.4;
    color: #2c2416;
  }

  .xianjia {
    font-size: 40rpx;
    font-weight: 700;
    color: #c93636;
  }

  .yuanjia {
    margin-left: 16rpx;
    font-size: 24rpx;
    color: #c09a6b;
    text-decoration: line-through;
  }

  .jilu {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #999;
  }
}

.pingdan-title {
  margin: 32rpx 0;
  font-size: 40rpx;
  font-weight: 700;
  color: #2c2416;
  text-align: center;
  letter-spacing: 2rpx;
}

.avatars {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  align-items: center;
  justify-content: center;
  margin: 48rpx 0;

  .avatar {
    width: 96rpx;
    height: 96rpx;
    border: 4rpx solid #fff;
    border-radius: 50%;
    box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.12);
  }
}

.buttons {
  display: flex;
  gap: 24rpx;
  justify-content: center;
  margin: 40rpx 32rpx;
}

.liucheng {
  display: flex;
  justify-content: space-around;
  padding: 40rpx 20rpx;
  margin: 32rpx;
  background: linear-gradient(135deg, #faf8f5 0%, #fff 100%);
  border-radius: 20rpx;

  .step {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
  }

  .icon {
    width: 72rpx;
    height: 72rpx;
    padding: 16rpx;
    background: linear-gradient(135deg, #fff8f0 0%, #ffe8cc 100%);
    border-radius: 50%;
    box-shadow: 0 4rpx 16rpx rgba(192, 154, 107, 0.2);
  }

  .content {
    margin-top: 16rpx;
    font-size: 24rpx;
    color: #666;
    text-align: center;
  }
}
</style>
