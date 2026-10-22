# Hook 参考代码

本目录仅供参考，正式业务禁止直接或间接导入。遵循 [脚手架保护与参考代码使用规范](../../../docs/ai/脚手架保护与参考代码使用规范.md)：非必要不修改，有明确需求时只提取必要实现到页面局部或 `src/hooks/project/`，没有需求则保留为参考。

以下为参考能力说明，不代表需要全部接入：

- useCountdown：共用时钟，页面 onShow/start、onHide/stop，作用域销毁时清理。
- useTabFilter：多页面有相同筛选需求时使用，简单筛选直接使用 computed。
- usePagedList：刷新替换查询时忽略旧响应；fetcher 调用现有 API。
  仅隔离结果，不取消网络请求。普通分页继续使用原有 useScroll，基础请求状态使用 useRequest。

分页结果由调用方适配为 `{ list, totalPage? }`。不读 token、不重复提示 HTTP 错误。
首次加载由页面主动调用 refresh，不自动发请求。
