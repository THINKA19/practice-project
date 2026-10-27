import { AGREEMENT_PAGES } from '../../agreement'
import { navigate } from '@/utils/project/navigation'

/** Login containers handle navigation emitted by the checkbox view. */
export function readUserAgreement() {
  void navigate(AGREEMENT_PAGES.user)
}
/** 由登录容器打开隐私政策正文，展示组件本身不决定业务导航。 */
export function readPrivacyPolicy() {
  void navigate(AGREEMENT_PAGES.privacy)
}
