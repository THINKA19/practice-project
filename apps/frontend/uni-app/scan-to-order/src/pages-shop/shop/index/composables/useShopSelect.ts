import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { shopText as st } from '@/locale/shop-text'
import { acceptStaffInvite, useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { confirm, prompt, toast } from '@/utils/project/interaction'
import { ShopRoutes } from '@/pages-shop/routes'
import { useSessionState } from '@/pages/auth/session'

const relaunch = (url: string) => uni.reLaunch({ url })

export function useShopSelect() {
  const store = useMerchantShopStore()
  const accepting = ref(false)
  onShow(() => {
    void store.refresh()
  })
  async function choose(id: string) {
    if (store.loading)
      return
    if (await store.switchShop(id))
      relaunch(ShopRoutes.Workspace.workspace)
  }
  async function logout() {
    if (!await confirm({ title: '退出商家账号', content: '确认退出当前商家账号？' }))
      return
    await useSessionState().logout()
    relaunch(ShopRoutes.Access.login)
  }
  async function acceptInvite() {
    const session = useSessionState()
    const token = session.validToken
    if (!token || session.identity !== 'shop' || accepting.value)
      return
    accepting.value = true
    try {
      const code = await prompt({ title: st('接受门店邀请'), placeholder: st('请输入邀请码') })
      if (!code || token !== session.validToken)
        return
      await acceptStaffInvite(token, code)
      if (token === session.validToken) {
        await store.refresh()
        if (token === session.validToken)
          toast(st('邀请已接受'), 'success')
      }
    }
    catch (error) {
      if (token === session.validToken)
        toast(st(error instanceof Error ? error.message : '邀请无效'))
    }
    finally {
      accepting.value = false
    }
  }
  return { store, choose, logout, acceptInvite, accepting }
}
