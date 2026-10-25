# unibest 项目概览

基于 uniapp + Vue3 + TypeScript + Vite5 + UnoCSS 的跨平台开发框架,支持 H5、小程序、APP 多平台,无需 HBuilderX,命令行开发。

## AI 开发前必读

遵循最小改动原则：非必要不修改，只处理当前明确需求直接涉及的文件和逻辑；不顺手重构、批量格式化、搬迁目录或增加无实际调用方的能力。

`src/store/**` 已收敛为 Pinia 基础设施与历史会话兼容入口，普通业务开发禁止改动或新增业务代码；业务状态归所属模块，共享会话归 `src/pages/auth/session/`。必要变更条件见下方必读规范的“Store：稳定基础与兼容入口，非必要禁止修改”条款。

禁止新增、修改、删除、搬迁或格式化 `src/router/**` 中的任何文件；业务路由与权限职责见下方必读规范的“Router：禁止修改”条款。

`src/service/**` is OpenAPI-generated scaffold output. Do not edit it manually or run `pnpm openapi` during ordinary business work; see “OpenAPI-generated service: do not edit manually” in the required AI specification below.

业务开发禁止修改 `src/http/**`、`src/mock/**`（含代码、类型、测试、README），也禁止在目录外重写公共请求以绕过保护。具体边界与业务接入方式见下方必读规范的“HTTP 与公共 Mock”条款。

根级 `src/api/` 已取消，禁止重建或新增文件（含类型和兼容转发）；接口和类型归所属业务模块的 `api/`、`models/`，不得借修复公共 HTTP 引用恢复根级 API 目录。

开发、复刻、提取函数、重构和检查代码前，必须阅读并遵守 [脚手架保护与参考代码使用规范](./docs/ai/脚手架保护与参考代码使用规范.md)。其中规定原有脚手架的保护边界、shared 参考代码的使用限制，以及按实际需求提取正式实现的流程；不得把 shared 当作项目运行时公共库。

## 工程规范(Hermes)

详细规范唯一事实源在 [hermes/](./hermes/README.md),按场景取用:

| 场景 | 文档 |
|------|------|
| 架构:事实源与生成物、平台接缝、校验边界、目录分层 | [hermes/architecture.md](./hermes/architecture.md) |
| 代码:命名、SFC 结构、TS、状态、提交、合入门禁 | [hermes/conventions.md](./hermes/conventions.md) |
| 平台:差异决策树、条件编译速查、本项目差异点表 | [hermes/platforms.md](./hermes/platforms.md) |
| 请求:分层、错误四分类、401 双 token 策略 | [hermes/api.md](./hermes/api.md) |
| SOP:新页面/全局组件/分包/tabbar/hooks | [hermes/sop-new-page.md](./hermes/sop-new-page.md) |
| 性能:分包规则、包体积检查、编码侧规则 | [hermes/performance.md](./hermes/performance.md) |
| 发布:upload:mp、changesets、uvm、环境切换 | [hermes/release.md](./hermes/release.md) |

三条铁律(全文见 hermes/README.md):

1. **生成物不手改**:`src/pages.json`、`src/manifest.json`、`src/types/*.d.ts` 由 `*.config.ts` 生成,手改会被覆盖
2. **平台差异只用条件编译**:编译期能确定的不留运行时
3. **UI 优先原子类**:先 UnoCSS,再自定义 CSS

## AI 辅助 Skills

项目自带 `.agents/skills/`(信任项目后自动加载),按场景选用:

| Skill | 用途 |
|-------|------|
| uni-app | 框架文档参考:条件编译、生命周期、pages/manifest 配置;查官方文档优先用其推荐的 `search-docs-by-Uniapp-official` MCP 工具 |
| uniapp-project | 官方组件/API 集成细节与跨端兼容性 |
| uview-pro-vue3 | uView Pro 组件库参考(项目当前未安装该依赖,使用前先安装) |

## 核心配置文件

- [package.json](mdc:package.json) - 依赖和脚本
- [vite.config.ts](mdc:vite.config.ts) - 构建配置
- [pages.config.ts](mdc:pages.config.ts) - 路由配置(事实源)
- [manifest.config.ts](mdc:manifest.config.ts) - 应用清单(事实源)
- [uno.config.ts](mdc:uno.config.ts) - UnoCSS 配置

## 常用命令

```bash
pnpm dev          # H5
pnpm dev:mp       # 微信小程序
pnpm dev:app      # APP
pnpm build:mp     # 微信小程序生产构建
pnpm upload:mp    # 小程序上传(见 hermes/release.md)

# 合入前门禁(三条全过)
pnpm type-check && pnpm lint && pnpm test:run
```
