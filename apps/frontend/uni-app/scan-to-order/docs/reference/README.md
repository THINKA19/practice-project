# 历史参考资料

这里集中保留从生产源码迁出的参考实现，不是业务公共库，也不提供运行时统一导出入口。处理规则唯一来源为 [脚手架保护与参考代码使用规范](../ai/脚手架保护与参考代码使用规范.md)。

- [hooks](./hooks/README.md)：原 src/hooks/shared，倒计时、分页及筛选参考。
- [kernel](./kernel/README.md)：原 src/utils/shared/kernel，日期、金额、存储、轮询和事件参考。
- [platform](./platform/README.md)：原 src/utils/shared/platform，导航、交互反馈和宿主能力参考。

## 正式入口与使用边界

已接入的导航和基础反馈位于 [src/utils/project](../../src/utils/project/README.md)。其他参考功能不代表项目已经支持。需要采用时，先检查现有脚手架，再按实际需求提取到页面局部、src/hooks/project 或 src/utils/project，完成业务调用和对应验证。

旧 src 路径不保留副本或兼容转发；无调用方的 kernel/platform 汇总导出文件已清理。正式业务禁止直接或间接导入本目录，参考实现不与正式实现双向同步。

## 文件与验证

保留内部相对依赖和历史测试；示例中的相对路径仅用于理解参考文件，不能当作正式业务导入示例。部分文件依赖 Vue、uni 或项目路径别名，因此本目录不是独立可运行的软件包。历史测试不自动执行，也不用于证明正式业务可用。

当前 TypeScript/Vitest 的 include 限定在 src；自动导入仍只扫描 src/hooks；ESLint 忽略 docs/reference。没有新增历史测试配置，也没有扩大业务扫描范围。以后调整这些配置时应继续保持参考资料与正式源码隔离。
