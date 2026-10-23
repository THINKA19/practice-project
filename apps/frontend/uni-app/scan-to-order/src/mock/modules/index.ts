import type { MockWrapper } from '@alova/mock'
import foo from './foo-alova.mock'
import home from '@/pages/home/index/mock'

/** 显式登记便于审查；不扫描目录，不自动加载历史参考或测试文件。 */
export const mockModules: Record<string, MockWrapper> = {
  'foo-alova': foo,
  home,
}
