# banner-carousel

共享轮播展示组件，目录和文件使用小写连字符命名。

- `index.vue`：模板、参数和事件装配。
- `use-carousel.ts`：过滤无图记录、派生单图/多图状态、将点击索引映射回原始数据。
- `index.scss`：容器及角标样式，通过 scoped 外部样式接入。
- `types.ts`：最小展示契约，仅要求 `picUrl`；其他业务字段原样保留。
- `index.ts`：对外导出入口。

参数：`items`、`height`（默认 `150rpx`）、`radius`（默认 `16rpx`）、`label`（默认空）。无有效图片时隐藏；单图静态、多图轮播。`select` 事件返回原始选中项，页面负责请求、广告位/门店范围、生命周期和跳转，组件不依赖业务模块。

```vue
<script setup lang="ts">
import { BannerCarousel } from '@/components/banner-carousel'
</script>

<template>
  <BannerCarousel :items="banners" height="110rpx" @select="handleBanner" />
</template>
```

首页使用 `280rpx`，菜单区使用 `110rpx`，全局广告使用 `150rpx` 并由业务传入“广告”标签。页面间距由调用方控制。不需要额外的全局状态或全局注册。
