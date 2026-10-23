# 项目导航与基础反馈

正式实现不依赖 `utils/shared`。当前调用方为首页 `useNavigation` 和 `useBanners`。

- `navigation.ts`：`navigate(path, query?)` 编码参数并复用现有 `isPageTabbar` 选择 `navigateTo/switchTab`，仍经过项目原有路由拦截器。不决定业务目标、不自动提示或回退。
- `feedback.ts`：`toast(title)` 展示调用方提供的本地化文字，空文字不展示。

导航返回 `Promise<NavigationResult>`：成功为 `{ ok: true }`，失败为 `{ ok: false, error }`，保留原始平台失败或同步异常。外链和 hash 不在当前支持范围；tabbar 导航按 uni-app 规则舍弃查询参数，不保证参数传递。现有拦截器若取消调用且不触发 success/fail，Promise 不代表该守卫流程的最终结果，不据此实现全局 Loading。

```ts
import { navigate } from '@/utils/project/navigation'
import { toast } from '@/utils/project/feedback'
import { t } from '@/locale'

const result = await navigate('/pages/detail/index', { id: 12 })
if (!result.ok)
  toast(t('common.navigationFailed'))
```

业务路径由页面/路由表持有。以后替换为独立 PC 路由或反馈组件时，在这两个入口实现适配，并核对目标路径与导航完成语义；当前没有实现 Vue Router 或独立 PC 适配器。只接入本次首页范围，其他原有 uni 调用没有批量迁移。

旧平台实现已迁至 [历史参考](../../../docs/reference/platform/README.md)，不再位于 src，不提供旧路径导出。此目录是已接入的导航和基础反馈的正式实现；处理规则统一见 [AI 规范](../../../docs/ai/脚手架保护与参考代码使用规范.md)。
