# 首页 Mock 图片

首页相关的模拟数据图片集中存放在这里，由业务模块的 `mock/` 数据文件通过 `@/mock/assets/images/home/...` 导入。

- `banner/`：首页轮播图。
- `products/`：团购、收藏共用的商品示例图片。
- `gift-card/`：礼品卡示例图片。

新增模拟图片按用途归类，不在 `src/pages/home/**` 中存放图片。Mock 数据、处理器和状态仍归所属业务模块。

`static/images/gift-card/classic.png` 保留为正式组件的加载失败兜底图；这里的 `gift-card/classic.png` 由 Mock 独立使用。
