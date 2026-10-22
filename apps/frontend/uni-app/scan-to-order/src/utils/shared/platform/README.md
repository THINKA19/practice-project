# 平台能力参考契约

本目录仅供参考，正式业务禁止直接或间接导入。遵循 [使用规范](../../../../docs/ai/脚手架保护与参考代码使用规范.md)，非必要不修改，按实际需求提取最小实现。下文说明参考函数的行为，不代表项目已接入这些能力。

宿主能力封装保留在 device.ts，编译期平台差异使用条件编译。
异步能力失败抛出 PlatformError，reason 为 Unsupported、Denied、Cancelled 或 System。
original 保留原始宿主错误；detail=privacy 表示隐私授权问题。
上层通过 reason 判断，showError 对主动取消不弹错误提示。
业务状态结果（如 checkSession 的布尔值）保留其原有语义。
宿主新错误码须依据实际响应补充映射；未知错误归为 System。

requestPayment 当前仅支持微信小程序支付参数，其他编译平台返回 Unsupported；显式注册的测试替身优先。需要 App 支付时再扩展独立参数契约。

withLoading 使用并发计数，最后一个任务结束后关闭遮罩，显示首个任务的标题；运行期间不要混用手动 showLoading/hideLoading。
