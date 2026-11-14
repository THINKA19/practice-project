# 个人中心

本模块负责账户等级、服务评分、累计完成量，以及个人中心菜单与联系站长编排。实现沿用项目 uniapp-business-development Skill；参考源码仅用于比较，不被运行时代码引用。

## 目录与维护边界

- api/：所属 endpoints、HTTP 请求及必要 DTO；不直接导入 Mock。
- models/：领域类型与外部响应校验。
- composables/：use-overview.ts 拥有页面级概览、loading、error 和请求序号；页面关闭及换号清空。资料来自 account/profile，今日统计来自 delivery/task。
- mock/：entry.mock.ts 经任务模块 mock/index.ts 读取完成量，由本模块 fixtures.ts 生成概览，不复制任务状态。
- __tests__/：overview.test.ts 检查坏响应、重试、换号与销毁；contact.test.ts 检查演示号码与旧确认隔离。
- index.ts：跨模块公开出口；没有外部消费者的页面模块不暴露内部实现。

## 接口与状态

GET /operator/rider/account。level: string；rating: number | null（0～5，未知显示 —）；completedCount: 非负整数。

接口使用公共 Alova 客户端、骑手 Authorization 请求头和 cacheFor: 0。真实配送业务需先确认后端契约并设置 VITE_RIDER_BACKEND_ENABLED=true；登录单独使用登录配置。开发环境开启 Mock 时，骑手 API 按需加载本模块模拟数据。真实服务使用公共 Alova 请求链。见 [分包说明](../../README.md)。

## 验证

在应用根执行 pnpm test:run src/pages-rider、pnpm exec eslint src/pages-rider、pnpm type-check；构建使用 pnpm build:h5、pnpm build:mp。全量基线失败与本模块测试分开报告。真实服务、真机、后台推送及结算尚未验证。

数据归属见 [docs/db.md](docs/db.md)。
