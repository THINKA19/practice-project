# 国际化

## 文件与职责

- `zh-Hans.json`、`en.json`、`vi.json`：语言包唯一编辑源，保留嵌套业务对象，供 Vue 和 uni-app 编译器读取。
- `index.ts`：语言实例、响应式状态、启动恢复、切换及普通 TS 字符串插值。
- `../components/locale/`：语言选择入口、图标、选中状态和实例独立的弹层。
- `../tabbar/index.vue`：当前页面可见时监听语言变化刷新原生导航，并在页面显示时补刷。
- `../tabbar/i18n.ts`：解析导航键并执行原生导航更新；语言模块不依赖导航。

## 分类与使用

`common` 放跨业务通用操作，`tabbar` 放导航标签，`home` 放首页自己的展示和提示。优惠券、取号等业务仍使用各自命名空间，不因为首页提供入口就搬入 `home`。
首页按 `home.user`、`home.delivery`、`home.features`、`home.banner` 分类，不复制组件目录层级。旧拼写 `home.feaature` 已迁移为 `home.features`。
三个语言文件保持相同的键和插值变量。新增文案同时维护三语；不使用顶层平铺键替代业务对象。

Vue 模板使用 `useI18n().t`；普通 TS 使用 `t`：

```ts
import { computed } from 'vue'
import { t, setLocale } from '@/locale'

const guestName = computed(() => t('home.user.guest'))
setLocale('vi')
// 提示文案在事件触发时求值，不缓存已翻译的业务状态。
uni.showToast({ title: t('common.pageNotFound'), icon: 'none' })
```

自定义 `t(key, data)` 仅返回字符串，支持命名及嵌套变量；缺失变量保留占位符。未知键、对象键和数组键返回键名，不抛出 replace 错误。需要数组内容时使用具体条目键或 Vue i18n 的资源 API；自定义入口不承诺复数或链接消息语法。
演示文案位于 `demo`，例如 `demo.weight`。

## 语言状态

支持 `zh-Hans`、`en`、`vi`。启动优先读取 `Language` 缓存，无缓存或读取失败时使用系统语言；通过 `normalizeLocale` 兼容 `zh_CN`、`en-US`、`vi_VN`，不支持的值回退中文。
`setLocale` 接受支持的精确代码，非法值忽略。先更新当前会话，再分别尝试 `uni.setLocale` 和同步缓存；失败记录警告，不影响会话切换或关闭选择弹窗。缓存失败意味着下次启动未必保留本次选择。
启动恢复仅设置 Vue 语言，不主动改变系统语言；页面显示时同步导航标签。

## 覆盖与验证边界

首页静态文案、游客兜底、轮播失败提示及语言弹层接入三语。用户昵称、接口会员等级名称、轮播图片中的文字和品牌名不由前端静态语言包自动翻译。其他业务页面需分别核对，不能据此认定全站已国际化。
测试覆盖三语键/变量一致性、语言恢复与失败边界、已挂载首页切换和原生导航更新；浏览器布局、小程序和 App 真机表现仍需平台验收。现有导航入口数量不在本次调整范围内。

导航资源遵循原有 tabbar/config.ts 的键：`tabbar.ordering` 和 `tabbar.pickup`。文案调整应修改三语 JSON，不重命名导航配置键。tabbar/index.vue 原有 onShow 负责页面显示时刷新；新增的可见性受控语言监听仅补齐停留当前页切换语言时的刷新。
