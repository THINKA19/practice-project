import type { ILoginForm } from '@/api/modules/auth/account'

/** 商家后台登录表单：账号 + 密码提交给后端，验证码 / 记住账号只在页面上用 */
export interface AdminLoginForm extends Pick<ILoginForm, 'username' | 'password'> {
  /** 图形验证码（后端开启验证码时才填写；/auth/login 当前不接收该字段） */
  captcha: string
  /** 记住账号 */
  rememberAccount: boolean
}
