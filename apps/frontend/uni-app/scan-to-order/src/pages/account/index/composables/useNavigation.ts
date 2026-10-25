/** 账户页业务跳转，复用正式公共导航。 */
import type { Ref } from 'vue'
import type { IUserInfoRes } from '@/pages/auth/session'
import type { NavigationResult } from '@/utils/project/navigation'
import { navigate } from '@/utils/project/navigation'
import { toast } from '@/utils/project/feedback'
import { t } from '@/locale'
import { ClientRoutes } from '@/pages/routes'

/** 提供功能测试页及客户登录跳转，失败时显示提示。 */
export function useNavigation(user: Readonly<Ref<Pick<IUserInfoRes, 'userId'> | null>>) {
  let pending: Promise<NavigationResult> | null = null

  function open(path: string, title?: string) {
    if (pending)
      return pending
    pending = (title ? navigate(path, { title }) : navigate(path)).then((result) => {
      if (!result.ok)
        toast(t('common.navigationFailed'))
      return result
    }).finally(() => {
      pending = null
    })
    return pending
  }

  function navTo(title: string) {
    if (title === '意见反馈')
      return open(ClientRoutes.Account.feedback, title)
    if (title === '会员码')
      return open(ClientRoutes.Account.userCode, title)
    return open(ClientRoutes.Account.test, title)
  }

  function editNick() {
    return user.value ? navTo('修改昵称') : open(ClientRoutes.Auth.login)
  }

  return { navTo, editNick }
}
