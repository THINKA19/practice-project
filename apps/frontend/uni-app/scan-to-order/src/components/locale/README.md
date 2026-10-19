# 语言切换组件

首页通过 `@/components/locale` 导入 `LanguageSwitcher`。按钮打开原有的 `wd-popup` 底部弹窗，支持简体中文、English 和 Tiếng Việt，带选中标记和取消按钮。每个组件实例独立管理弹窗开关。

- `index.vue`：按钮和语言图标。
- `composables/useLanguage.ts`：语言选项及选择交互。
- `img/`：三种语言的图标。
- `src/locale/index.ts`：唯一语言状态、语言包、切换及 `Language` 缓存恢复。
- `src/main.ts`：语言变化及页面显示时刷新原生 tabbar。

当前翻译范围为语言按钮和底部导航，不自动翻译业务页面。越南语缺少的文案回退到中文。中文为未知语言的默认值，兼容旧缓存 `zh_CN`。

导航使用 `%tabbar.xxx%` 键，普通中文文字仍可直接显示。新增语言需要同步语言包、支持列表及此组件的语言选项。

矢量源文件（标准圆形国旗开源库）：[circle-flags/flags at gh-pages · HatScripts/circle-flags](https://github.com/HatScripts/circle-flags/tree/gh-pages/flags)

