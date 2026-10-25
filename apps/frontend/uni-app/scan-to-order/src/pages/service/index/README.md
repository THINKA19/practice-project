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
