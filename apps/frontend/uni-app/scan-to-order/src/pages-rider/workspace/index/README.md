# 骑手工作台

本模块负责工作台公告与可选配送费参考目标，以及任务、资料和提醒的页面装配。实现沿用项目 uniapp-business-development Skill；参考源码仅用于比较，不被运行时代码引用。

工作台以只读方式显示当前运营服务区。窄屏使用单列任务卡，桌面根据窗口宽度使用两列或三列，内容铺满可用宽度。历史订单从「我的」进入。

## 目录与维护边界

- api/：所属 endpoints、HTTP 请求及必要 DTO；不直接导入 Mock。
- models/：领域类型与外部响应校验。
- composables/：use-overview.ts 只维护工作台配置。任务快照、上下线和动作来自 delivery/task；姓名来自 account/profile。下拉刷新同时读取任务与配置。
- mock/：fixtures.ts 提供演示公告和 120 元参考目标，entry.mock.ts 校验骑手会话。
- __tests__/：overview.test.ts 检查配置验证与会话隔离；page.test.ts 检查资料响应性、参考进度及下拉刷新结束。
- index.ts：跨模块公开出口；没有外部消费者的页面模块不暴露内部实现。

## 接口与状态

GET /operator/rider/workspace。announcement: string；incomeTarget: 正数 | null。null 隐藏参考进度，不能视为保底收入。

接口使用公共 Alova 客户端、骑手 Authorization 请求头和 cacheFor: 0。真实配送业务需先确认后端契约并设置 VITE_RIDER_BACKEND_ENABLED=true；登录单独使用登录配置。开发环境开启 Mock 时，骑手 API 按需加载本模块模拟数据。真实服务使用公共 Alova 请求链。见 [分包说明](../../README.md)。

## 验证

在应用根执行 pnpm test:run src/pages-rider、pnpm exec eslint src/pages-rider、pnpm type-check；构建使用 pnpm build:h5、pnpm build:mp。全量基线失败与本模块测试分开报告。真实服务、真机、后台推送及结算尚未验证。

数据归属见 [docs/db.md](docs/db.md)。
