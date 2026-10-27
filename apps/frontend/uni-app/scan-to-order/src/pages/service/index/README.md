# 服务

展示门店活动与环境实拍分组，支持图片预览和组内横向滚动。

页面：`/pages/service/index/index`。公开入口：`index.ts`（serviceApi、ActivityGalleryGroup、ActivityGalleryImage）。

## 职责

- `index.vue`：页面配置、生命周期与装配。
- `components/`：有实际需要时存放本领域 UI。
- `composables/`：响应式状态、请求编排和生命周期。
- `models/`：有本地契约时存放类型、枚举、转换和纯规则；不保留旧 type.ts 转发入口。
- `api/`：有本领域接口时提供请求函数，路径只定义在 endpoints.ts，复用 Alova。
- `mock/`：有本领域接口时提供独立模拟入口与样本；由全局 Mock 清单登记，页面和运行时公共入口不导入 Mock。

共享已有业务能力时从所属模块 index.ts 引入，不为了目录齐全复制 API/模型或创建空目录。没有当前需求的 storage/domain/adapters 不创建。

## 数据与验证边界

group.id：分组标识；title：标题；images：图片数组；image.url/label：本地图片路径与说明；moreUrl：可选应用内地址。Mock 使用 src/mock/assets/images/lunbo 的本地资源，不伪造更多页面。H5 鼠标拖动与箭头采用条件编译，其他端使用 scroll-view 触摸；状态按组件隔离，销毁移除监听。

开发环境设置 VITE_USE_MOCK=true 并重启；生产构建强制关闭 Mock，关闭后请求真实后端。Mock 不是生产数据或真实支付/履约结果。请求错误复用 HTTP 提示，模型以 [接口说明](./docs/db.md) 为准。

当前 Mock 提供门店活动、用餐环境、餐品展示、聚会活动、节日主题、服务瞬间六组，每组 16 项，循环使用仓库内八张本地素材。PC 左右按钮支持分步切换，到首尾时禁用对应按钮，不循环；移动端使用 scroll-view 原生触摸滚动，H5 移动浏览器也保留箭头按钮。全局联系方式组件 ContactDock 位于 src/components/contact-dock/，使用 Wot 已安装字体图标；未新增社交图标或图片依赖。栏目与按钮跟随统一语言实例实时切换。

页面内容使用可用全宽，不设置桌面最大宽度。页面关闭外层滚动；纵向内容由内部 z-paging 承载，背景覆盖导航栏与底部菜单之间的区域。各图片分组使用独立的 scroll-view 横向滚动。

## 当前入口与行为

六组内容超过视口后由内部 z-paging 承担纵向滚动。

联系方式通过 @/components/contact-dock 公共入口引入，账号配置由 useServiceContacts 提供；全局组件仅持有展示和交互逻辑。页面背景保持从浅粉到浅桃的全视口底色，底部不再渐变成纯白。

## 空状态与异常展示

页面每次显示时重新加载。加载、成功无活动和请求失败分别展示统一状态区；无活动保留联系方式，不提供重试按钮。

状态展示采用已安装 Wot UI 的 `wd-empty` 和 `wd-loading`，业务操作由页面提供。

公共状态统一接入 `src/components/page-state/index.vue`，通过 status 区分 loading、empty 和 error；加载固定为上方三点动画、下方统一加载文案。

## 当前目录与职责边界

本模块位于 `src/pages/service/index`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `serviceApi`、`ActivityGalleryGroup`、`ActivityGalleryImage`。
- 依赖领域：无跨领域业务依赖；框架与公共基础设施按已有入口使用。
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `components/`：业务 UI；入口为组件目录内的 index.vue；私有逻辑就近放置，复合组件的私有子部件放 parts/。
- `mock/`：仅开发模拟；entry.mock.ts 沿用现有发现机制，跨 Mock 仅通过 mock/index.ts。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/index.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-gallery.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-gallery-actions.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-contacts.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-view.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `components/Gallery/use-gallery.ts`：组件实例私有的交互状态，不接管领域共享状态。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Service`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useService<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
