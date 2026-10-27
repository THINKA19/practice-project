/** 多渠道客服开发样本；二维码载荷均为 DEMO 文本，不对应真实账号。 */
import { defineMock } from '@alova/mock'
import { ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { endpoints } from '../api/endpoints'

export default defineMock({
  [`[GET]${endpoints.config}`]: withFailure(() => ok({
    demo: true,
    business_time: '每日 09:00–21:00（演示）',
    phone: '',
    wechat_contact_enabled: false,
    channels: [
      { id: 'wechat', kind: 'wechat', primary: true, name: '客服微信', account: 'DEMO_WECHAT', description: '点餐咨询与订单协助', qr_image: '/static/images/contact-demo/wechat.png' },
      { id: 'official', kind: 'wechat_official', name: '微信公众号', account: 'DEMO_OFFICIAL', description: '服务通知与品牌动态', qr_image: '/static/images/contact-demo/official.png' },
      { id: 'qq', kind: 'qq', name: 'QQ 客服', account: 'DEMO_QQ', description: '一对一咨询与使用帮助', qr_image: '/static/images/contact-demo/qq.png' },
      { id: 'group', kind: 'qq_group', name: '客服 QQ 群', account: 'DEMO_QQ_GROUP', description: '交流与问题反馈，入群后请先阅读群公告', qr_image: '/static/images/contact-demo/group.png' },
      { id: 'telegram', kind: 'telegram', name: 'Telegram', account: '@DEMO_TELEGRAM', link: 'https://example.invalid/contact-demo/telegram', description: '电报客服与技术支持', qr_image: '/static/images/contact-demo/telegram.png' },
      { id: 'facebook', kind: 'facebook', name: 'Facebook', account: 'DEMO_FACEBOOK', description: '品牌主页与服务消息，私信请使用 Messenger', link: 'https://example.invalid/contact-demo/facebook', contact_link: 'https://example.invalid/contact-demo/messenger', qr_image: '/static/images/contact-demo/facebook.png' },
      { id: 'x', kind: 'x', name: 'X（Twitter）', account: '@DEMO_X', description: '产品动态与公开交流，订单问题请联系主客服', link: 'https://example.invalid/contact-demo/x', qr_image: '/static/images/contact-demo/x.png' },
      { id: 'whatsapp', kind: 'whatsapp', name: 'WhatsApp', account: 'DEMO_WHATSAPP', description: '海外订单咨询与一对一沟通', link: 'https://example.invalid/contact-demo/whatsapp', qr_image: '/static/images/contact-demo/whatsapp.png' },
      { id: 'instagram', kind: 'instagram', name: 'Instagram', account: '@DEMO_INSTAGRAM', description: '餐品展示与品牌动态，服务时间内回复私信', link: 'https://example.invalid/contact-demo/instagram', qr_image: '/static/images/contact-demo/instagram.png' },
    ],
  })),
})
