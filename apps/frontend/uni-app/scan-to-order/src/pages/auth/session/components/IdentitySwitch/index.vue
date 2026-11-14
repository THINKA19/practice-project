<script setup lang="ts">
import type { SessionIdentity } from '../../models/types'
import { computed, onScopeDispose, ref } from 'vue'
import { t } from '@/locale'
import { ClientRoutes } from '@/pages/routes'
import { navigate } from '@/utils/project/navigation'
import { useSessionState } from '../../composables/use-state'

const props = defineProps<{ target: SessionIdentity }>()
const session = useSessionState()
const current = computed(() => session.hasLogin && session.identity !== props.target ? session.identity : null)
const switching = ref(false)
let disposed = false

onScopeDispose(() => {
  disposed = true
})

function cancel() {
  if (switching.value)
    return

  const fallback = () => {
    void navigate(ClientRoutes.Account.my)
  }
  if (getCurrentPages().length > 1)
    uni.navigateBack({ fail: fallback })
  else
    fallback()
}

async function switchIdentity() {
  const { hasLogin, identity } = session.updateNowTime()
  if (switching.value || !hasLogin || !identity || identity === props.target)
    return

  switching.value = true
  const pending = session.logout()
  const revision = session.sessionRevision
  try {
    await pending
  }
  catch {
    if (!disposed && revision === session.sessionRevision)
      uni.showToast({ title: t('auth.identitySwitch.signOutFailed'), icon: 'none' })
  }
  finally {
    if (!disposed)
      switching.value = false
  }
}
</script>

<template>
  <view v-if="current || switching" class="role-login box-border flex flex-col px-16px text-[#17392a]">
    <view class="role-login-card mx-auto box-border max-w-520px w-full rounded-20px bg-white px-24px py-28px">
      <view class="mb-20px text-center text-24px font-bold">
        {{ t('auth.identitySwitch.title') }}
      </view>
      <view v-if="current" class="mb-20px text-16px leading-relaxed">
        {{ t('auth.identitySwitch.message', {
          current: t(`auth.identitySwitch.roles.${current}`),
          target: t(`auth.identitySwitch.roles.${target}`),
        }) }}
      </view>
      <wd-button round block :loading="switching" :disabled="switching" @click="switchIdentity">
        {{ t('auth.identitySwitch.confirm', { target: t(`auth.identitySwitch.roles.${target}`) }) }}
      </wd-button>
      <button :disabled="switching" class="switch-cancel" hover-class="switch-cancel--pressed" @tap="cancel">
        {{ t('auth.identitySwitch.cancel') }}
      </button>
    </view>
  </view>
  <slot v-else />
</template>

<style scoped src="@/style/role-login.css"></style>

<style scoped>
.switch-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  margin: 8px 0 0;
  padding: 10px 18px;
  border-radius: 999px;
  background: #e8ecea;
  color: #52635a;
  font-size: 16px;
  line-height: 1.45;
}
.switch-cancel::after {
  border: none;
}
.switch-cancel--pressed {
  background: #dbe1de;
}
</style>
