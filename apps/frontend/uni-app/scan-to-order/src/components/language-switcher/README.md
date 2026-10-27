# 语言切换组件

`index.vue` 提供文字入口或 `icon-only` 图标入口，复用同一个 `wd-popup` 底部选择弹层，支持简体中文、English、Tiếng Việt。

- `composables/use-picker.ts`：语言选项、选中态、弹层开关；每个组件实例的弹层独立。
- `img/`：语言图标。
- `src/locale/index.ts`：唯一语言状态和持久化入口；无额外语言 Store。
- `src/tabbar/index.vue`：当前页面可见时监听语言变化，页面显示时补刷原生导航。

```vue
<script setup lang="ts">
import LanguageSwitcher from '@/components/language-switcher/index.vue'
</script>

<template>
  <LanguageSwitcher icon-only />
</template>
```

语言名称使用各语言自身名称，便于用户在陌生语言下切回。入口与取消文案随当前语言变化，图标入口提供 aria-label。弹层保留 `z-index="1000"`、`root-portal` 和底部安全区。

选择有效语言后关闭弹层；平台同步或缓存写入失败不阻断当前会话切换。新增语言需要同步语言包注册、规范化规则和此处语言选项。

组件只负责选择语言，不自动翻译页面原文或服务端内容。语言资源与接入规则见 [国际化说明](../../locale/README.md)。

矢量源文件：[circle-flags](https://github.com/HatScripts/circle-flags/tree/gh-pages/flags)。
