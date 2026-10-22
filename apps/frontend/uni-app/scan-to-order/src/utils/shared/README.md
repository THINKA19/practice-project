# 工具参考代码

本目录仅供参考，正式业务禁止直接或间接导入。遵循 [脚手架保护与参考代码使用规范](../../../docs/ai/脚手架保护与参考代码使用规范.md)：非必要不修改，有明确需求时只提取必要实现到局部模块或 `src/utils/project/`，不预建目录，不批量复制。

- kernel 中保留纯工具参考实现，按真实需求评估提取，不要求全局装配；存储工具不替代现有 Pinia 持久化。
- platform 中保留跨端、交互和测试辅助函数的参考实现。简单 uni 调用可以直接使用。
- HTTP 和错误契约沿用 src/http；登录与用户状态沿用 src/store/token.ts、src/store/user.ts。
- 三端身份互斥直接由 src/store/token.ts 处理，访问判断位于 src/router/roleAccess.ts；不提供独立 session 包装层。
- navigation 只执行跳转；目标和返回兜底由调用方传入，路由常量仍由各端 routes.ts 维护。
- 路由常量不会注册页面；新增分包仍需配置现有 UniPages，不能手改生成的 pages.json。
- 正式业务引用提取后的正式文件，不从本目录转发导出，不增加旧路径兼容层、注册中心或全局初始化流程。
