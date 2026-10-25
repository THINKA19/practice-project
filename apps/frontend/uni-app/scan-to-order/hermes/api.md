# 请求层规范

> 事实源:`src/http/http.ts`(请求封装)+ `src/http/interceptor.ts`(拦截器)。本文规则均来自这两个文件的实际行为。

> 业务开发禁止修改公共 HTTP 和 Mock，也禁止重建根级 src/api；保护边界以 [脚手架保护规范](../docs/ai/脚手架保护与参考代码使用规范.md) 为准。

## 1. 分层

```
页面/组件
   ↓ 只调用
src/pages/**/api/*   # 页面业务模块接口
src/modules/auth/   # 跨页面认证与当前用户能力（公开入口 index.ts）
   ↓ 只调用
src/http/http.ts     # httpGet/httpPost/httpPut/httpDelete
   ↓ 自动经过
src/http/interceptor.ts  # URL 拼接、token 注入、超时
   ↓
uni.request / uni.uploadFile
```

业务代码**禁止**直接调 `uni.request`;新接口放在所属业务模块的 `api/`，入参/出参类型放在该模块的 `models/`。跨页面认证能力通过 `@/modules/auth` 使用；不再创建根级 `src/api/`。

## 2. 调用方式

```ts
import { httpGet, httpPost } from '@/http'

// GET(query 自动序列化拼接)
const data = await httpGet<IUser>('/user/info', { id: 1 })

// POST:第二参是 body,第三参是 query(微信系接口常用,勿省)
await httpPost<ILoginRes>('/login', { username, password }, { platform: 'wx' })
```

- `http<T>` 直接 resolve 业务 `data`(响应契约 `{ code, data, ... }` 已在封装内拆包)
- 超时 60s、`Authorization: Bearer <token>` 均由拦截器注入,**业务不手写请求头 token**

## 3. 错误处理(类型归一)

catch 到的永远是 `HttpError`,`type` 四选一,按需分支:

| type | 触发 | 默认行为 |
|------|------|---------|
| `Auth` | HTTP 401 或业务码 401 | 封装内已处理(见下),业务只需 catch |
| `Business` | HTTP 2xx 但业务码失败 | 自动 toast 错误消息 |
| `Http` | 非 2xx 状态码 | 自动 toast |
| `Network` | 请求 fail | 自动 toast「网络错误」 |

静默场景(自己处理提示)传 `hideErrorToast`:

```ts
await httpPost('/log/track', payload, undefined, undefined, { hideErrorToast: true })
```

## 4. 401 / token(业务零处理)

由 `http.ts` 统一处理,受 `env/.env` 的 `VITE_AUTH_MODE` 控制:

- `single`:清用户态 → 跳登录页
- `double`:用 refreshToken 无感刷新(并发请求进队列,刷新成功后自动重放;失败才登出)

**业务代码不要自行处理 401,也不要读 store 手动拼 Authorization。**

## 5. 地址与环境

- 基准地址 `VITE_SERVER_BASEURL`;第二后端用 `VITE_SERVER_BASEURL_SECONDARY`
- H5 dev 开代理时(`VITE_APP_PROXY_ENABLE=true`)自动走 `/fg-api` 前缀,nginx 需同步该前缀
- 微信三环境(开发/体验/正式)用 `VITE_SERVER_BASEURL__WEIXIN_*` 覆写,见 platforms.md 第 4 节
- 对接多个后端：使用已有请求配置选择服务，不修改 `interceptor.ts`；无法满足时记录缺口，不在业务任务中扩展公共实现。
