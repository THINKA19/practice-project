import type { ContactItem } from '@/components/contact-dock'
import { computed } from 'vue'
import { t } from '@/locale'
/** 服务页拥有演示联系方式；全局组件不持有业务账号。 */
export function useServiceContacts() {
  return computed<ContactItem[]>(() => [
    { id: 'wechat', label: t('service.wechat'), icon: 'message', color: '#fff', background: '#07c160', action: { type: 'copy', value: 'snscanfood' } },
    { id: 'telegram', label: 'Telegram', icon: 'link', color: '#0088cc', background: '#eaf6ff', action: { type: 'link', value: 'https://t.me/snscanfood' } },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'phone', color: '#169b50', background: '#eaf9ef', action: { type: 'link', value: 'https://wa.me/8613800000000' } },
    { id: 'facebook', label: 'Facebook', icon: 'link', color: '#1877f2', background: '#edf3ff', action: { type: 'link', value: 'https://facebook.com/snscanfood' } },
  ])
}
