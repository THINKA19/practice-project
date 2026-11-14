import type { ShopSettingsForm } from '../../models/index'
import type { ShopRequestContext } from '@/pages-shop/auth/permissions'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, ref, shallowRef, watch } from 'vue'
import { shopText as st } from '@/locale/shop-text'
import { useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { confirm, showError, toast } from '@/utils/project/interaction'
import { shopSettingsApi } from '../../api/settings'
import { getBusinessSchedule, localDay } from './businessSchedule'

const permission = 'shop.settings.manage'

export function useShopSettings() {
  const context = useMerchantShopStore()
  const settings = shallowRef<Awaited<ReturnType<typeof shopSettingsApi.load>>>()
  let captured: ShopRequestContext | undefined
  const loading = ref(false)
  const saving = ref(false)
  const now = ref(new Date())
  let request = 0
  let timer: ReturnType<typeof setInterval> | undefined

  const form = computed(() => settings.value?.form)
  const schedule = computed(() => getBusinessSchedule(form.value?.businessHours ?? [], now.value))
  const today = computed(() => localDay(now.value))
  const closurePlan = computed(() => {
    const entry = form.value?.temporaryClosure
    return entry && entry.until >= today.value ? entry : undefined
  })
  const closure = computed(() => {
    const plan = closurePlan.value
    return plan && (!plan.from || plan.from <= today.value) ? plan : undefined
  })
  const canUpdate = computed(() => context.can(permission))

  watch(() => context.revision, () => {
    captured = undefined
    settings.value = undefined
  }, { flush: 'sync' })

  async function load() {
    const started = ++request
    loading.value = true
    captured = undefined
    settings.value = undefined
    try {
      await context.refresh()
      if (started !== request)
        return

      const sent = context.capture(permission)
      const result = await shopSettingsApi.load(sent)
      if (started === request && context.matches(sent)) {
        captured = sent
        settings.value = result
      }
    }
    catch (error) {
      if (started === request)
        showError(error)
    }
    finally {
      if (started === request)
        loading.value = false
    }
  }

  function stopClock() {
    clearInterval(timer)
  }

  onShow(() => {
    stopClock()
    now.value = new Date()
    timer = setInterval(() => {
      now.value = new Date()
    }, 10000)
    if (!captured || !context.matches(captured))
      void load()
  })
  onHide(stopClock)
  onUnload(() => {
    stopClock()
    request++
    captured = undefined
  })

  async function updateSettings(changes: Partial<Pick<ShopSettingsForm, 'businessStatus' | 'businessHours' | 'temporaryClosure'>>) {
    const current = settings.value
    const sent = captured
    if (!current || !sent || saving.value || !canUpdate.value)
      return

    saving.value = true

    try {
      if (changes.businessStatus === false && !await confirm({
        title: st('停止营业'),
        content: st('暂停后顾客无法提交新订单，已接订单仍可继续处理。'),
        confirmText: st('停止营业'),
      })) {
        return
      }

      if (captured !== sent || !context.matches(sent) || !context.can(permission))
        throw new Error(st('门店或权限已变化，请重新进入设置'))

      await shopSettingsApi.save(sent, current.version, { ...current.form, ...changes })
      if (captured === sent && context.matches(sent)) {
        await load()
        if (settings.value)
          toast(st('保存成功'), 'success')
        return true
      }
    }
    catch (error) {
      showError(error)
      if (captured === sent && context.matches(sent)) {
        try {
          const latest = await shopSettingsApi.load(sent)
          if (captured === sent && context.matches(sent))
            settings.value = latest
        }
        catch {
          // Keep the current snapshot and draft available for retry.
        }
      }
    }
    finally {
      saving.value = false
    }
  }

  return { form, schedule, today, closure, closurePlan, canUpdate, loading, saving, load, updateSettings }
}
