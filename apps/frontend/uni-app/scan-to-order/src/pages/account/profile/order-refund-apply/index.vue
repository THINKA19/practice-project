<script setup lang="ts">
/**
 * 售后申请 / 售后详情（View：只做装配与渲染）
 * 来源：bee-master/pages/refund-apply
 */
import { useI18n } from 'vue-i18n'
import { onLoad, onShow } from '@dcloudio/uni-app'
import LogisticsDialog from './components/LogisticsDialog/index.vue'
import OptionRadioList from './components/OptionRadioList/index.vue'
import ProofUploader from './components/ProofUploader/index.vue'
import RefundDetailPopup from './components/RefundDetailPopup/index.vue'
import RefundHistory from './components/RefundHistory/index.vue'
import SectionCard from './components/SectionCard/index.vue'
import { MAX_PROOF_PICS } from './composables/use-form'
import { useOrderRefundApplyPage } from './composables/use-page'

definePage({
  style: {
    navigationBarTitleText: '申请售后',
  },
})
const { t } = useI18n()
const vm = useOrderRefundApplyPage()
const { goods, refundApplyList, form, detail, loading, failed, orderId } = vm
const { submitting, goodsIndex, curGoods, number, type, logisticsStatus, reason, remark, picsList, reasonOptions, typeOptions, logisticsStatusOptions } = form
const { popShow, curRefund, logisticsContent, logisticsDialogShow, shipperName, trackingNumber, customerServiceType } = detail
onLoad((query) => {
  vm.init(query as {
    id?: string
  })
})
onShow(() => {
  void vm.loadOrder()
})
</script>

<template>
  <view class="refund-container">
    <view v-if="!orderId" class="p-32rpx text-center">
      {{ t('refund.missingOrder') }}
    </view>
    <view v-else-if="loading" class="p-32rpx text-center">
      {{ t('refund.loading') }}
    </view>
    <view v-else-if="failed" class="p-32rpx text-center">
      <button @tap="vm.loadOrder()">
        {{ t('refund.retry') }}
      </button>
    </view>
    <view v-else-if="!goods.length" class="p-32rpx text-center">
      {{ t('refund.empty') }}
    </view>
    <block v-if="orderId && !loading && !failed">
      <!-- 我的售后 -->
      <SectionCard v-if="refundApplyList.length" :title="t('refund.myRefund')">
        <RefundHistory :list="refundApplyList" @select="vm.openRefund" />
      </SectionCard>

      <!-- 选择商品 -->
      <SectionCard :title="t('refund.selectGoods')">
        <view class="goods-list">
          <view
            v-for="(item, idx) in goods"
            :key="item.id"
            class="goods-item"
            :class="{ disabled: !item.afterSale }"
            @tap="form.selectGoods(idx)"
          >
            <view class="goods-content">
              <view class="goods-name-text">
                {{ item.goodsName }}
              </view>
              <view v-if="!item.afterSale" class="not-support">
                {{ t('refund.notSupport') }}
              </view>
            </view>
            <wd-icon
              :name="goodsIndex === idx ? 'check-circle-fill' : 'uncheck-circle'"
              :color="goodsIndex === idx ? '#CF8E63' : '#ccc'"
              size="20px"
            />
          </view>
        </view>
      </SectionCard>

      <block v-if="curGoods">
        <!-- 商品信息 + 数量 -->
        <SectionCard :title="t('refund.goodsInfo')">
          <view class="goods-preview">
            <image class="preview-image" :src="curGoods.pic" mode="aspectFill" />
            <view class="preview-info">
              <view class="preview-name">
                {{ curGoods.goodsName }}
              </view>
              <view class="preview-price">
                ¥{{ curGoods.amount }}
              </view>
            </view>
          </view>
          <view class="quantity-selector">
            <text class="selector-label">
              {{ t('refund.refundNumber') }}
            </text>
            <wd-input-number
              :model-value="number"
              :min="1"
              :max="curGoods.number"
              @update:model-value="form.setNumber"
            />
          </view>
        </SectionCard>

        <!-- 售后类型 -->
        <SectionCard :title="t('refund.refundType')">
          <OptionRadioList v-model="type" :options="typeOptions" />
        </SectionCard>

        <!-- 货物状态（仅退款） -->
        <SectionCard v-if="type === '0'" :title="t('refund.logisticsStatus')">
          <OptionRadioList v-model="logisticsStatus" :options="logisticsStatusOptions" />
        </SectionCard>

        <!-- 售后原因 -->
        <SectionCard :title="t('refund.refundReason')">
          <OptionRadioList v-model="reason" :options="reasonOptions" />
        </SectionCard>

        <!-- 售后说明 -->
        <SectionCard :title="t('refund.refundRemark')" :tip="t('refund.refundRemarkOptional')">
          <view class="remark-box">
            <textarea
              v-model="remark"
              class="remark-input"
              :placeholder="t('refund.refundRemarkPlaceholder')"
              placeholder-class="remark-placeholder"
              :maxlength="500"
              auto-height
            />
          </view>
        </SectionCard>

        <!-- 上传凭证 -->
        <SectionCard :title="t('refund.uploadProof')" :tip="t('refund.uploadProofOptional')">
          <ProofUploader
            :files="picsList"
            :max="MAX_PROOF_PICS"
            :upload-text="t('refund.uploadProof')"
            @choose="form.choosePics()"
            @remove="form.removePic"
            @preview="form.previewPic"
          />
        </SectionCard>

        <!-- 提交 -->
        <view class="submit-box">
          <button class="submit-btn" :loading="submitting" :disabled="submitting" @tap="form.submit()">
            {{ t('refund.submitBtn') }}
          </button>
        </view>
      </block>

      <view class="safe-area" />
    </block>
  </view>

  <!-- 售后详情 -->
  <RefundDetailPopup
    v-model="popShow"
    :record="curRefund"
    :logistics-content="logisticsContent"
    :customer-service-type="customerServiceType"
    @preview="detail.preview"
    @cancel-apply="detail.cancelApply()"
    @fill-logistics="detail.showLogisticsDialog()"
    @customer-service="detail.customerService()"
  />

  <!-- 填写寄回快递 -->
  <LogisticsDialog
    v-model="logisticsDialogShow"
    v-model:shipper-name="shipperName"
    v-model:tracking-number="trackingNumber"
    @submit="detail.submitLogistics()"
  />
</template>

<style lang="scss" scoped>
.refund-container {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 24rpx 0 40rpx;
  background: linear-gradient(180deg, #fff9f5 0%, #fff3ec 50%, #ffeee5 100%);
}

.goods-list {
  padding: 0 32rpx 24rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 2rpx solid #f8f1eb;

  &:last-child {
    border-bottom: none;
  }

  &.disabled {
    opacity: 0.5;
  }
}

.goods-content {
  flex: 1;
  margin-right: 24rpx;
}

.goods-name-text {
  font-size: 28rpx;
  line-height: 40rpx;
  color: #5a4a3a;
}

.not-support {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #ff9800;
}

.goods-preview {
  display: flex;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #fffbf8 0%, #fff 100%);
  border-bottom: 2rpx solid #f8f1eb;
}

.preview-image {
  flex-shrink: 0;
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(135deg, #fff5f0 0%, #ffebe0 100%);
  border: 3rpx solid #fff9f5;
  border-radius: 16rpx;
}

.preview-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: 24rpx;
}

.preview-name {
  display: -webkit-box;
  overflow: hidden;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 42rpx;
  color: #5a4a3a;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.preview-price {
  margin-top: 16rpx;
  font-size: 36rpx;
  font-weight: 600;
  color: #cf8e63;
}

.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
}

.selector-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #5a4a3a;
}

.remark-box {
  padding: 24rpx 32rpx 32rpx;
}

.remark-input {
  box-sizing: border-box;
  width: 100%;
  min-height: 180rpx;
  padding: 24rpx;
  font-size: 28rpx;
  line-height: 42rpx;
  color: #5a4a3a;
  background: linear-gradient(135deg, #fffbf8 0%, #fff9f5 100%);
  border: 2rpx solid #f0e6db;
  border-radius: 16rpx;
}

.submit-box {
  padding: 0 24rpx;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 96rpx;
  color: #fff;
  text-align: center;
  letter-spacing: 2rpx;
  background: linear-gradient(135deg, #e8b899 0%, #cf8e63 100%);
  border-radius: 48rpx;
  box-shadow: 0 12rpx 32rpx rgba(207, 142, 99, 0.3);

  &:active {
    transform: scale(0.98);
  }
}

.safe-area {
  height: 40rpx;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
