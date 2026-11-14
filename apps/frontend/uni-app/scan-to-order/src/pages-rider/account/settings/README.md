# 接单规则与提醒设置

本模块负责服务端接单规则的读取和提醒设置页的组合。实现沿用项目 uniapp-business-development Skill；参考源码仅用于比较，不被运行时代码引用。

## 目录与维护边界

- api/：所属 endpoints、HTTP 请求及必要 DTO；不直接导入 Mock。
- models/：领域类型与外部响应校验。
- composables/：use-rules.ts 管理当前页读取状态；声音与震动由 delivery/task 的提醒模块拥有，页面不维护重复偏好。
- mock/：fixtures.ts 提供演示规则，entry.mock.ts 通过本模块读取函数校验身份。指派超时仅展示规则，模拟后端尚未实现自动回收调度。
- __tests__/：rules.test.ts 检查参数归一化、坏响应、失败重试和换号隔离。
- index.ts：跨模块公开出口；没有外部消费者的页面模块不暴露内部实现。

## 接口与状态

GET /operator/rider/rules。maxConcurrent: 正整数；assignmentTimeoutSeconds: 非负秒数；serviceShops、rules。规则只读，不将本地配置当作后端限制。

接口使用公共 Alova 客户端、骑手 Authorization 请求头和 cacheFor: 0。真实配送业务需先确认后端契约并设置 VITE_RIDER_BACKEND_ENABLED=true；登录单独使用登录配置。开发环境开启 Mock 时，骑手 API 按需加载本模块模拟数据。真实服务使用公共 Alova 请求链。见 [分包说明](../../README.md)。

## 验证

在应用根执行 pnpm test:run src/pages-rider、pnpm exec eslint src/pages-rider、pnpm type-check；构建使用 pnpm build:h5、pnpm build:mp。全量基线失败与本模块测试分开报告。真实服务、真机、后台推送及结算尚未验证。

数据归属见 [docs/db.md](docs/db.md)。
