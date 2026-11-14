# 骑手资格与权限

本模块负责服务端骑手资格、权限列表和敏感动作前的授权检查。实现沿用项目 uniapp-business-development Skill；参考源码仅用于比较，不被运行时代码引用。

## 目录与维护边界

- api/：所属 endpoints、HTTP 请求及必要 DTO；不直接导入 Mock。
- models/：领域类型与外部响应校验。
- composables/：useRiderPermissionsStore 存在本模块 composables/use-store.ts。每个任务写动作先刷新权限，再核对当前账号、资格和具体 permission；权限失败按拒绝处理。
- mock/：fixtures.ts 创建账号专属的演示权限；entry.mock.ts 从模拟会话识别 riderId。模拟权限不代表真实账号获得生产授权。
- __tests__/：permissions.test.ts 检查缺权、无资格、跨账号授权、网络失败、迟到响应与未登录。
- index.ts：跨模块公开出口；没有外部消费者的页面模块不暴露内部实现。

## 接口与状态

GET /operator/rider/permissions。riderId: 当前会话 userId 的字符串形式；qualified: boolean；permissions: string[]。实际业务后端仍须检查身份、门店、任务归属和版本。

接口使用公共 Alova 客户端、骑手 Authorization 请求头和 cacheFor: 0。真实配送业务需先确认后端契约并设置 VITE_RIDER_BACKEND_ENABLED=true；登录单独使用登录配置。开发环境开启 Mock 时，骑手 API 按需加载本模块模拟数据。真实服务使用公共 Alova 请求链。见 [分包说明](../../README.md)。

## 验证

在应用根执行 pnpm test:run src/pages-rider、pnpm exec eslint src/pages-rider、pnpm type-check；构建使用 pnpm build:h5、pnpm build:mp。全量基线失败与本模块测试分开报告。真实服务、真机、后台推送及结算尚未验证。

数据归属见 [docs/db.md](docs/db.md)。
