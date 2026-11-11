# 礼品卡兑换

本模块完整拥有兑换请求、模型、页面流程和业务 Mock，不经 gift-card 代理这些职责。

## 文件职责

- `index.vue`：现有页面注册、生命周期和视图组装；页面地址不变。
- `components/`：接收页面状态、展示及发出交互，不直接调用客户端。
- `composables/use-page.ts`：useCardExchangePage，负责身份校验、异步编排、状态和恢复。
- `api/endpoints.ts`、`api/exchange.api.ts`：本模块端点与明确参数的请求；仅使用既有 `@/http/alova`，读取客户凭证，关闭缓存与公共 toast，不重试写操作。
- `models/`：本领域请求/响应契约；响应形状无需转换时直接共用接口类型，不增加同形 DTO 副本。需要校验的响应由 mappers.ts 处理，不在请求层写业务判断。
- `mock/entry.mock.ts`：唯一自动发现登记，引用本模块 endpoints。
- `index.ts`：`useCardExchangePage`；API 无生产跨模块消费者，不额外导出。
- `__tests__/`：所属业务及边界回归；`docs/db.md`：已知契约和后端待确认项。

## 状态与业务规则

兑换码、协议、提交中和完成状态归本页；已使用兑换码按账户隔离，归本模块 mock/state.ts。

检查非空兑换码、协议及客户身份后提交；提交中与完成后禁止重复提交。失败保留表单，成功才返回卡包。换账户或页面卸载后忽略迟到响应。

## Mock 归属与依赖

`mock/data.ts` 定义 GIFT-DEMO 及目标模板；`mock/state.ts` 提供隔离实例与 reset。发卡通过 gift-card/mock 的 addCard，事件通过 gift-card-logs/mock 写入，不复制持卡或流水状态。

会话由 auth/session 唯一持有。卡模板和持卡模型归 gift-card，通过公开入口引用；本模块不复制资产或登录 Store。普通业务不导入 Mock，Mock 跨模块只使用对方 mock/index.ts，生产构建使用现有隔离机制。

## 验证与限制

在应用根目录运行 `pnpm exec vitest run src/pages/home/service/gift-card-exchange --maxWorkers=2`；完整链路测试在 gift-card-receive/__tests__/mock-flow.test.ts。合入门禁仍为 `pnpm type-check`、`pnpm lint`、`pnpm test:run`，构建检查使用 `pnpm build:h5`、`pnpm build:mp` 及 `pnpm check:mock-output dist/build/h5 dist/build/mp-weixin`。

Mock 数据仅存在当前进程，不能证明真实支付、事务、幂等、授权或微信双设备分享可用。真实契约及 SQL 资料缺失项见 [数据参考](./docs/db.md)。
