# 骑手资料

本模块负责姓名、手机号、服务门店和站点联系方式的读取与编辑。实现沿用项目 uniapp-business-development Skill；参考源码仅用于比较，不被运行时代码引用。

## 目录与维护边界

- api/：所属 endpoints、HTTP 请求及必要 DTO；不直接导入 Mock。
- models/：领域类型与外部响应校验。
- composables/：useRiderProfileStore 维护版本化资料和保存锁。页面草稿在 use-page.ts；共享 session 资料只读，不写入第二份登录身份。
- mock/：state.ts 按模拟账号维护资料，读取返回深拷贝，保存校验版本；entry.mock.ts 登记 reset。演示站点只能复制号码。
- __tests__/：store.test.ts 检查保存与会话隔离；contract.test.ts 检查版本冲突、数据副本和字段验证。
- index.ts：跨模块公开出口；没有外部消费者的页面模块不暴露内部实现。

## 接口与状态

GET /operator/rider/profile；POST /operator/rider/profile/save。id、version、name、phone、joinedAt、serviceShops、station。保存体仅 version/name/phone，版本冲突拒绝覆盖。姓名非空最多 30 字；手机号 11 位。

接口使用公共 Alova 客户端、骑手 Authorization 请求头和 cacheFor: 0。真实配送业务需先确认后端契约并设置 VITE_RIDER_BACKEND_ENABLED=true；登录单独使用登录配置。开发环境开启 Mock 时，骑手 API 按需加载本模块模拟数据。真实服务使用公共 Alova 请求链。见 [分包说明](../../README.md)。

## 验证

在应用根执行 pnpm test:run src/pages-rider、pnpm exec eslint src/pages-rider、pnpm type-check；构建使用 pnpm build:h5、pnpm build:mp。全量基线失败与本模块测试分开报告。真实服务、真机、后台推送及结算尚未验证。

数据归属见 [docs/db.md](docs/db.md)。
