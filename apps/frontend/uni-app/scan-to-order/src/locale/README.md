# 国际化

## 文件与职责

- `zh-Hans.json`、`en.json`、`vi.json`：语言包唯一编辑源，由 Vue 和 uni-app 编译器直接读取。
- `index.ts`：vue-i18n 实例、响应式语言状态、翻译、语言选择持久化及启动恢复。
- `__tests__/locale.test.ts`：三语导航、缓存恢复、语言规范化、弹窗状态隔离测试。
- `../components/locale/`：原有底部语言选择弹窗和 SVG 图标。
- `../tabbar/i18n.ts`：原生导航文字更新，只在当前为 tabbar 页面时执行。

## 编译兼容

语言文件统一放在框架约定的 `src/locale/*.json`，直接编辑并提交这些文件，无需生成副本。新增语言还需在 `index.ts` 导入并注册，同时更新支持语言列表和组件选项。

## 使用与行为

语言包按模块使用嵌套对象：`tabbar` 管导航文案，`common` 管通用操作，`i18n` 管多语言示例，`alova` 管请求示例。新增文案放进所属模块对象，例如 `"tabbar": { "home": "首页" }`，不使用 `"tabbar.home"` 这样的顶层平铺属性。
调用继续使用 `t('tabbar.home')` 或模板中的 `$t('tabbar.home')`。插值示例使用 `i18n.weight`、`i18n.detail`、`i18n.introduction`。
原生导航由 `tabbar/i18n.ts` 解析 `%tabbar.home%`，需要由实际挂载的 tabbar 组件生命周期调用；语言模块本身不注册导航监听。

通过 `setLocale(code)` 切换语言，通过 `currentLocale` 读取状态；支持简体中文、英语、越南语。
启动优先读取 `Language` 缓存，无缓存则使用系统语言，未知语言回退简体中文；兼容 `zh_CN`、`en-US`、`vi-VN` 等值。
切换时同步 Vue 语言、`Language` 缓存和 `uni.setLocale()`；缓存写入失败不会阻止当前会话切换。启动时恢复 Vue 语言，语言模块不额外调用系统语言同步。

`%tabbar.xxx%` 用于导航配置，普通文字原样显示。Vue 使用已注册的 vue-i18n；普通 TypeScript 可使用 `t()`，支持平铺或嵌套键与变量插值。缺少越南语文案时回退中文，未知键返回键名。

## 验证范围

当前完成语言选择入口和原生底部导航三语切换，不等于所有业务页面已翻译。业务页面需要逐项补齐文案和替换硬编码文字。
现有六项原生导航通过 H5 验证；原生 tabbar 的跨端标准上限为五项，发布小程序前必须明确入口取舍。
