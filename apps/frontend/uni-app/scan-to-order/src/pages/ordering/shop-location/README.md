# 门店位置

源码核对：2026-10-28。

## 页面与职责

`index.vue`：门店位置，URL 参数 id。

装配门店位置、中文地区、当地地址、复制反馈和地图选择；门店详情快照由 shop-detail 公开能力提供。

## 公开能力与依赖

`useShopLocationPage`。

依赖：shop-detail；门店 index 公开的地图链接、地区目录、地图组件；menu 链接适配。不引用其他领域的内部文件。

跨领域只通过对方 index.ts；页面只由路由加载，内部组件使用 components/组件名/index.vue。

## 状态所有权与规则

导航面板与复制定时器属于页面实例；切店、页面隐藏、重新初始化或销毁时清理对应交互。门店数据只持有当前页面快照。

H5 使用无需 Key 的 Google 网页 iframe，并直接打开 Google 导航。小程序使用原生 map，外部地图链接只复制。优先有效坐标，无坐标时允许地址导航。地图加载不代表路线可用或设备验证通过。

## Mock 与数据资料

无独立 Mock，复用门店数据；真实地图网络、海外覆盖和平台能力需实机验证。

接口与数据归属见 [docs/db.md](./docs/db.md)。规范正文见 [项目 Skill](../../../../.agents/skills/uniapp-business-development/SKILL.md)，验证结果统一记录在 [ordering/VALIDATION.md](../VALIDATION.md)。

## 验证边界

本地 Mock、单元测试和构建不代表真实后端、支付、地图网络及设备行为已验证；无权威后端资料的表结构、状态枚举与业务约束保留待确认。
