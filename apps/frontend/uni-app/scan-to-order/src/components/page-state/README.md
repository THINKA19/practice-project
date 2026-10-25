# page-state

公共页面状态组件。沿用相邻公共组件的目录结构：`index.vue` 为组件实现，`index.ts` 为公开入口，通过 `import { PageState } from '@/components/page-state'` 使用，不需要新增全局注册配置。

- `status`：loading / empty / error，由页面判断；组件不请求数据。
- `title`：空状态或错误提示；加载时统一使用 common.loading，中文为“正在加载中”。
- `description`：空状态或错误的可选说明。
- `fill`：填充父级 flex 布局的剩余高度，不创建滚动容器；父容器需要有明确高度。
- `compact`：用于列表内的局部提示；fill 优先。
- 默认插槽：页面提供的业务操作，仅在非加载状态展示，组件不改变按钮颜色。

加载使用 Wot wd-loading 的 dots 动画与 vertical 布局；无数据和错误使用 wd-empty。仅供展示，不管理请求、缓存、登录或导航。
