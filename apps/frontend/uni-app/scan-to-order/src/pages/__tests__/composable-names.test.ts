import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { expect, it } from 'vitest'

const root = path.resolve('src')
const domains: Record<string, string> = {
  'components/language-switcher': 'LanguageSwitcher',
  'components/contact-dock': 'ContactDock',
  'pages/account/assets/asset': 'Asset',
  'pages/account/assets/asset-cash-log': 'CashLog',
  'pages/account/assets/asset-recharge-log': 'RechargeLog',
  'pages/account/assets/coupons': 'Coupon',
  'pages/account/assets/score': 'Score',
  'pages/account/index': 'Account',
  'pages/account/profile/about': 'About',
  'pages/account/profile/address': 'Address',
  'pages/home/service/gift-card': 'Card',
  'pages/home/service/gift-send': 'GiftSend',
  'pages/home/service/gift-receive': 'GiftReceive',
  'pages/account/profile/contact': 'Contact',
  'pages/account/profile/feedback': 'Feedback',
  'pages/account/profile/order': 'Order',
  'pages/account/profile/order-refund-apply': 'OrderRefundApply',
  'pages/account/services/bill-pay': 'BillPay',
  'pages/account/services/booking': 'Booking',
  'pages/account/services/scan-result': 'OrderVerification',
  'pages/account/services/sign-in': 'SignIn',
  'pages/account/users/member-center': 'MemberCenter',
  'pages/account/users/user-code': 'UserCode',
  'pages/auth/agreement': 'Agreement',
  'pages/auth/login': 'Login',
  'pages/auth/session': 'Session',
  'pages/home/index': 'Home',
  'pages/ordering/shop': 'ShopSelect',
  'pages/pickup/index': 'Pickup',
  'pages/pickup/shared': 'Pickup',
  'pages/pickup1/doing': 'OrderDoing',
  'pages/pickup1/index': 'OrderDetail',
  'pages/pickup1/scan-result': 'ScanResult',
  'pages/queue/index': 'Queue',
  'pages/service/index': 'Service',
  'pages-shop/auth/login': 'ShopLogin',
  'pages-shop/auth/permissions': 'Merchant',
  'pages-shop/onboarding': 'Onboarding',
  'pages-rider/auth/login': 'RiderLogin',
}

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? files(file) : [file]
  })
}
const composables = ['pages', 'pages-shop', 'pages-rider', 'components'].flatMap(dir => files(path.join(root, dir))).filter(file => path.basename(path.dirname(file)) === 'composables' && file.endsWith('.ts') && path.basename(file) !== 'index.ts')

it('领域组合文件按职责命名，导出的 Hook 使用 use<Domain><Duty>', () => {
  expect(composables.length).toBeGreaterThan(0)
  for (const file of composables) {
    const module = path.relative(root, path.dirname(path.dirname(file))).replaceAll('\\', '/')
    const domain = domains[module]
    expect(domain, `${module} 必须明确领域名称`).toBeDefined()
    const filename = path.basename(file)
    expect(filename, file).toMatch(/^use-[a-z]+(?:-[a-z]+)*\.ts$/)
    const duty = filename.slice(4, -3).split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('')
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
    for (const statement of source.statements) {
      if (!ts.canHaveModifiers(statement) || !ts.getModifiers(statement)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword))
        continue
      const names = ts.isFunctionDeclaration(statement)
        ? [statement.name?.text || '']
        : ts.isVariableStatement(statement) ? statement.declarationList.declarations.map(declaration => declaration.name.getText(source)) : []
      for (const name of names.filter(name => /^use[A-Z]/.test(name)))
        expect(name, file).toBe(`use${domain}${duty}`)
    }
  }
})
