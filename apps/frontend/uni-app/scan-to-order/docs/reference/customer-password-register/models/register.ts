import { accountError } from '../../login'

export interface RegisterForm { username: string, password: string, confirmPassword: string }
export function registerError(form: RegisterForm): string | undefined {
  const error = accountError(form.username, form.password)
  if (error)
    return error
  if (form.password.length < 8)
    return 'auth.passwordLength'
  if (form.password !== form.confirmPassword)
    return 'auth.passwordMismatch'
}
