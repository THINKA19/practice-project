# Mock 架构与接入规范

本文是 Mock 设计与开发规则的唯一正文，修改 Mock 时必须同时核对项目请求实现。公共层由架构维护者管理，业务开发只改所属模块，不维护中央业务清单。具体实现和验证结果以目标项目源码及项目说明为准。

## 公共目录

公共 src/mock 扁平组织：index.ts（适配器和 resetAllMocks）、loader.ts（自动发现、判重、重置汇总）、config.ts（开关、延迟、日志、严格模式）、response.ts（响应与分页）、scenario.ts（故障与延迟）。测试集中在 __tests__，按源文件命名，另有 contract.test.ts 检查全部登记结构及所属 endpoints 清单。

```text
src/mock/
├── index.ts
├── loader.ts
├── config.ts
├── response.ts
├── scenario.ts
└── __tests__/
    ├── index.test.ts
    ├── loader.test.ts
    ├── response.test.ts
    ├── scenario.test.ts
    └── contract.test.ts
```

不建 registry、全局业务样本目录、业务共享 Mock 层或无实际调用的类型文件。文档不在 src/mock 或 docs/ai 重复维护。

## 业务目录与入口

业务沿用既有目录：api/endpoints.ts 保存路径，models 保存 DTO，mock/entry.mock.ts 是唯一登记入口。handlers.ts、data.ts、state.ts、scenarios.ts、fixtures/ 和 __tests__ 按需创建。简单接口可以只有 entry.mock.ts。

```text
业务模块/
├── index.ts                    不转发 Mock
├── api/endpoints.ts
├── models/
└── mock/
    ├── entry.mock.ts           唯一必需登记入口
    ├── index.ts                有实际跨模块调用时创建
    ├── handlers.ts             有编排逻辑时创建
    ├── data.ts                 需要独立数据工厂时创建
    ├── state.ts                有状态写入时创建，提供 reset
    ├── scenarios.ts            有业务场景切换时创建
    ├── fixtures/               有大型静态样本时创建
    └── __tests__/              只增加有实际验证价值的测试
```

entry.mock.ts 默认导出 Alova MockWrapper，可以具名导出 reset。loader 只发现 src/pages/**/mock/entry.mock.ts 和 src/api/**/mock/entry.mock.ts，不扫描测试、参考资料或任意 index.ts。新增业务入口不修改公共文件。

路径引用本模块 endpoints 常量，不重复写字符串。默认 GET 与显式 GET 等价，判重键为方法大写加原始路径；同路径不同方法不冲突，重复报告两个来源。不要删除网关、域名、查询参数来猜测路径等价；新增路由形式必须与实际适配器匹配语义一起验证。

## 归属与引用边界

Mock 数据和状态归原业务模块，不另抽公共业务目录。只有确实需要联动时才建 mock/index.ts，其他 Mock 只能引用此出口；不得跨模块深度引用 data、state、handlers 或 entry。出口只导出必要数据工厂与状态操作，不导出接口规则。禁止循环依赖，不为少量相同字段抽象共享层。

普通页面、API、组件、composable 和业务根 index.ts 不引用业务 Mock。测试、Mock 内部、公共 loader、请求适配接缝是明确例外。已有只读取公共 config 的演示模式分支不加载业务数据，不因此重写认证流程；新增此类例外须说明必要性。ESLint 执行导入边界，契约测试检查依赖环与路径来源；不得用此规范授权无关请求迁移。

## 类型、响应与状态

数据工厂引用所属 models 的 DTO，每次返回独立对象。响应工具依赖请求层实际类型和错误码，不创造 ApiCode 或另一套信封。响应字段、空数据码、未登录码和分页结构必须匹配所接请求链与接口；不能把某个后端的 700/2000 等编码套用于所有客户端。

state.ts 表达内存模拟状态，提供实例工厂和 reset；重置不替换被 handler 捕获的实例。模块 entry 导出 reset，公共 resetAllMocks 汇总调用。共享状态只由归属模块登记重置一次。涉及全局模块状态的测试在 beforeEach 调用 resetAllMocks；创建局部实例的测试独立隔离。重置 Mock 不等于退出真实登录或清空 Pinia。

## 场景与未命中行为

默认正常，随机失败率为零。优先用 withFailure 的固定 error 场景、withDelay 的固定延迟；空数据和未登录等业务响应由模块按接口契约定义，不向真实 API 混入调试参数。随机失败只允许显式启用并注入可复现 random；写操作不能参与概率失败，固定故障在写入前触发，不自动重试。

未命中默认通过原适配器走真实网络并提示；严格模式拒绝未登记请求。渐进联调不保证完全离线，不能把网络回退当作 Mock 已覆盖。

## 请求链与生产隔离

使用现有请求链的适配接缝，不自行增加匹配框架。Alova Mock 只覆盖 Alova，不覆盖直接 uni.request、另一个 HTTP 客户端或上传下载；不得为了 Mock 自动迁移整个请求体系。

开发模式且显式开关同时成立才启用。生产即使误设开关也关闭，并在构建解析阶段替换 Mock 入口为空实现，不能只依赖运行时 if。构建插件检查最终 chunk 的已渲染模块，禁止业务 Mock 及公共 loader、scenario、response 残留；公共 config 的已折叠开关不等于业务数据残留。

H5 与目标小程序分别构建验证，不能只测 H5。新增扫描路径和分包必须复核产物；不依赖运行时动态加载模块。

## 验证与发布前检查

1. 公共测试验证接入、开关、未命中、判重、重置、响应与场景；独立探针不绑定页面样本。
2. contract.test.ts 只在测试中收集所属 endpoints，检查每条登记路径属于其模块；缺少 Mock 的 endpoint 只报告，不失败。不在运行时扫描 endpoints。
3. 路径集合不能证明源码使用了常量，应由静态检查核对。不得无参数执行所有 handler；复杂参数、状态和响应分支保留模块针对性测试。
4. 执行相关测试、修改文件 lint、项目类型检查和完整检查；范围外失败单独报告，不扩大修复。
5. 构建生产 H5 和小程序，包含误开 Mock 开关的情况，随后执行 pnpm check:mock-output dist/build/h5 dist/build/mp-weixin。目录按实际输出调整。
6. 产物脚本扫描专用标记和业务 Mock 源码路径，与构建模块检查配合使用，不用单词 mock 作为唯一依据，不承诺识别任意混淆内容。缺失或空产物必须失败。
7. 生产检查只代表编译产物验证，不代表真机、后端联调、支付或发布成功。Hermes 规范不修改。
