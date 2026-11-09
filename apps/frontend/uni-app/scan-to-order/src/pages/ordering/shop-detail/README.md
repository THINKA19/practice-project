# 门店详情

源码核对：2026-10-28。

## 页面与职责

`index.vue`：门店详情，URL 参数 id。

展示相册、介绍、营业时间、服务、电话、地址和位置图片；通过门店公开 API 获取快照，不拥有第二套门店接口或 Store。

## 公开能力与依赖

`useShopDetailPage`：详情快照与联系/导航动作，供位置页复用。

依赖：门店 index 的 API/模型/电话面板；menu 平台适配；现有导航及客户端路由表。

跨领域只通过对方 index.ts；页面只由路由加载，内部组件使用 components/组件名/index.vue。

## 状态所有权与规则

详情、错误、加载状态、照片、标记由 useShopDetailPage 实例持有；轮播/缩放由 ShopPhotoGallery、ShopImagePreview 组件持有。当前选中门店仍归门店 Store。

页面无效 id 清空旧快照；切店和卸载后丢弃旧响应。导航先进入位置页。相册仅在页面可见且未预览/拖动时轮播；预览不自动播放，支持 100%–400% 缩放。位置图片缺失或失败有明确提示。电话复用门店统一行为。

## Mock 与数据资料

不独立登记 Mock；使用门店详情接口模拟，地图示意图及介绍均为演示内容。

接口与数据归属见 [docs/db.md](./docs/db.md)。规范正文见 [项目 Skill](../../../../.agents/skills/uniapp-business-development/SKILL.md)，验证结果统一记录在 [ordering/VALIDATION.md](../VALIDATION.md)。

## 验证边界

本地 Mock、单元测试和构建不代表真实后端、支付、地图网络及设备行为已验证；无权威后端资料的表结构、状态枚举与业务约束保留待确认。
