# 认证分类目录

只组织 login（顾客微信登录）、register（旧入口跳转）、agreement（协议）和 session（跨页面唯一会话）。分类层不提供 index.ts、组件、composables 或状态。

商家与骑手登录在各自普通分包的 auth/login；权限分别在 auth/permissions。会话状态不再放入公共 store。
