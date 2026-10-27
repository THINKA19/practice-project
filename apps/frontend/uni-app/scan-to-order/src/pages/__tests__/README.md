# 页面层回归测试

这里存放跨页面、跨业务模块的自动化测试，不是小程序页面，也不需要在 `pages.json` 注册。模块自身的测试放在各模块的 `__tests__/` 中。

- `component-layout.test.ts`：检查局部组件目录与页面入口的结构约定。
- `composable-names.test.ts`：检查组合函数文件及导出名称的领域命名约定。
- `module-boundaries.test.ts`：检查 API、模型和跨模块导入的依赖边界。
- `subpackage-login-lifecycle.test.ts`：验证商家、骑手登录页销毁后，迟到的登录响应不会继续导航。

这些文件由 Vitest 执行，不是线上业务入口；应保留，用于发现后续改动引入的问题。在应用目录运行 `pnpm exec vitest run src/pages/__tests__`，或通过 `pnpm test:run` 执行全量测试。
