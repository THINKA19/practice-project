# Mock 框架

使用 `@alova/mock` 和现有 `src/http/alova.ts`，不另建 HTTP 或存储基础设施。

## 开关与范围

- `env/.env.development` 的 `VITE_USE_MOCK=true` 开启，修改后重启开发服务。
- 环境文件被仓库忽略；其他开发者拉取代码后需自行添加该配置。
- 生产构建强制关闭 Mock；开关为 false 或缺省时也不启用。
- 只作用于 `@/http/alova` 发出的请求，不拦截 `@/http/http` 或直接调用的 `uni.request`。
- 已登记的方法和路径由 Mock 响应；**未登记接口继续请求真实后端**。这是按接口渐进联调的框架，不是离线演示后端。
- 不模拟登录、支付、上传或任何已有业务。没有状态持久化、业务数据仓库或页面假数据开关。

## 架构与依赖方向

```text
现有 API → http/alova.ts → Mock 适配器 → modules → generators
                                              ↓
                                       utils/response

src/mock/
├── index.ts                   适配器创建与新手导航
├── config.ts                  开关、固定延迟、失败概率、日志配置
├── modules/
│   ├── index.ts               显式模块清单
│   └── foo-alova.mock.ts      唯一接口示例，与 api/foo-alova.ts 同名
├── generators/
│   ├── index.ts               运行时纯工厂出口
│   ├── foo.ts                 示例 DTO 工厂，每次返回新对象
│   └── common.ts              分页参数规范化与纯切片
├── fixtures/
│   └── README.md              静态 JSON 的使用边界，当前没有业务数据
└── utils/
    ├── response.ts            ok / fail / page 响应信封
    ├── scenario.ts            可控故障注入与 handler 类型
    └── register.ts            模块登记时检查重复路由
```

模块负责方法、路径、参数和场景选择，不应称为“纯数据”。
工厂只生成数据，可使用 `src/api` 的 DTO 类型，不依赖 URL、HTTP 客户端、页面、store 或平台 API。
响应工具复用现有 HTTP 契约，场景工具单独维护，不让响应文件同时承担故障调度。
入口依赖模块，模块不能反向导入入口；仅用 `import type` 引用 API 类型，不引入请求实例。

这比只放一个入口和模块更便于扩展，同时保留现有请求封装和 Alova 官方适配器。
不并行引入 Vite Mock 插件，不预建用户/token 工厂、55 张表、状态仓库或全局 ID 服务。

原 `mock1 / mock2 / mock3` 是保留的对比参考，未导入、未注册，不属于本框架的运行依赖。其历史测试和缺失依赖也不代表新框架的验证结果。

## 调用唯一示例

复用已有 API：

```ts
import { foo } from '@/api/foo-alova'

const result = await foo().send()
// 开发 Mock 开启时：{ id: 1, name: 'Mock 示例' }
// 仍经过现有 Alova responded 解包。
```

## 新增模块的步骤

1. 在 `src/api` 定义接口和 DTO，通过现有 `@/http/alova` 调用。
2. 在 `generators` 添加返回新对象的纯工厂，并从 `generators/index.ts` 导出。
3. 在 `modules` 创建与 API 文件同名的 `.mock.ts`，只编排路径、参数、工厂和响应。
4. 在 `modules/index.ts` 登记一行。不要对象展开合并路由后再登记，否则重复键已经丢失。
5. 添加该接口的契约测试，确认方法、参数、响应和异常分支。

每个路径显式写方法，例如 `[GET]/foo`。登记检查识别相同方法和路径（包括省略 GET、方法大小写）的重复，不分析不同参数化路径之间的语义重叠；重叠路径需由模块作者避免。

响应使用 `ok(data)`、`fail(message, code)`；分页使用 `page(完整列表, query)`，内部统一切片并计算总数，不能传入已经切片的列表。非法页码回退为 1，非法页大小回退为 10，越界页返回空列表。分页只复制数组，不深拷贝条目，所以传入数据必须来自本次请求的新工厂对象。

## 场景与行为配置

- 固定 `delay` 便于复现加载状态；当前不增加随机延迟调度层。
- `failureRate` 默认 0，只影响显式包装 `withFailure` 的接口。单接口可传 `{ rate: 1 }` 确定失败，或 `{ rate: 0 }` 确定成功。
- `withFailure` 支持同步和异步 handler；在执行 handler 前决定失败，测试可注入 `random` 函数重放概率分支。它模拟请求失败，不代表真实断网、截止时间超时或 HTTP 401。
- 业务失败用 `fail`；将来同一接口有多种业务场景时在对应模块内维护，不增设重复路径。不要把测试场景参数混入真实业务 API。
- 日期通过工厂参数传入基准时间；需要 ID 时优先使用确定数据，只有实际需要模拟写入后再增加可重置、按实例隔离的 ID 工厂。

## 验证

运行 `pnpm exec vitest run src/mock/adapter.test.ts src/mock/framework.test.ts`。
接入测试覆盖现有 HTTP 入口；框架测试覆盖重复登记、数据隔离、分页边界与故障注入。

仅为使用 Mock，不需要迁移已经走 `http.ts` 的业务接口，也不要把两套 HTTP 封装串联调用。

适配参数以已安装的 `@alova/adapter-uniapp` 为准，目前为 `AdapterUniapp({ mockRequest })`。
