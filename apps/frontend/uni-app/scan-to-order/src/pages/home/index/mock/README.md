# 首页 Mock

按功能分类，接口规则和样本数据放在同一个功能目录。

```text
mock/
├─ index.ts             首页 Mock 装配入口
├─ README.md            功能与接口说明
└─ banner/              首页轮播
   ├─ handlers.ts       接口规则、参数处理和响应
   └─ data.ts           轮播样本数据工厂
```

- **首页轮播**：`GET /banner/list`，对应 [banner/handlers.ts](./banner/handlers.ts)；接口路径复用 `../api/endpoints.ts`。
- **参数与数据**：`type=shouye` 返回三张本地轮播图，其他类型返回空数组；样本由 [banner/data.ts](./banner/data.ts) 维护，每次生成独立对象。
- **接入方式**：`mock/index.ts` 供全局 Mock 清单统一登记，页面和业务 API 不直接导入 Mock。开关和请求回退说明见[全局 Mock 文档](../../../../mock/README.md)。

新增功能时在 `mock/` 下建立对应功能目录，沿用 `handlers.ts` 和 `data.ts`，并在本文补充接口用途。同一功能的多个接口可放在同一个 `handlers.ts` 中。
