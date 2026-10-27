<script setup lang="ts">
/** 首页与“我的”共用的顾客身份展示；不读取会话、不决定业务跳转。 */
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { WechatAuthorizationPanel } from '@/pages/auth/login'
import ProfileEditorPanel from '../ProfileEditor/index.vue'

defineOptions({ name: 'CustomerProfile' })

const props = defineProps<{ hasLogin?: boolean, avatar: string, nick: string, levelName?: string }>()
const emit = defineEmits<{ login: [], avatar: [], profile: [], member: [] }>()
const { t } = useI18n()
const authorization = ref<InstanceType<typeof WechatAuthorizationPanel>>()
const editor = ref<InstanceType<typeof ProfileEditorPanel>>()
function openAccount() {
  if (props.hasLogin)
    editor.value?.open()
  else
    authorization.value?.open()
}
</script>

<template>
  <view class="customer-profile min-w-0 flex flex-1 items-center gap-24rpx">
    <image
      class="profile-avatar h-120rpx w-120rpx shrink-0 border-6rpx border-white rounded-full border-solid shadow-sm"
      :src="hasLogin ? avatar || '/static/images/default-avatar.png' : '/static/images/default-avatar.png'"
      mode="aspectFill"
      @tap="openAccount"
    />
    <view class="min-w-0 flex flex-1 flex-col items-start gap-12rpx">
      <text v-if="hasLogin" class="profile-name max-w-full truncate text-34rpx text-#333 font-600" @tap="openAccount">
        {{ nick || t('account.profile.wechatUser') }}
      </text>
      <button v-if="!hasLogin" class="wechat-login" @tap="openAccount">
        {{ t('auth.authorizeLogin') }}
      </button>
      <view v-if="hasLogin && levelName" class="vip-badge" @tap="emit('member')">
        {{ levelName }}
      </view>
    </view>
  </view>
  <WechatAuthorizationPanel ref="authorization" />
  <ProfileEditorPanel ref="editor" />
</template>

<style scoped>
.vip-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 40rpx;
  padding: 8rpx 20rpx;
  font-size: 22rpx;
  font-weight: 500;
  line-height: 1;
  color: #fff;
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  border-radius: 20rpx;
}
.wechat-login {
  padding: 12rpx 28rpx;
  margin: 0;
  font-size: 26rpx;
  line-height: 1.4;
  color: #fff;
  background: #07c160;
  border-radius: 40rpx;
}
.wechat-login::after {
  border: none;
}
</style>
