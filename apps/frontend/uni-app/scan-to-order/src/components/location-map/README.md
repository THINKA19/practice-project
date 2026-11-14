# LocationMap

公共地点预览组件。父容器提供高度，调用方传入坐标、坐标系、国家码和可选地址。页面管理门店数据、复制地址、地图选择弹层和外部导航。

- 微信小程序走原生地图。传入 `markers` 自定义标记，弹层打开时可传 `suspended` 暂停原生地图。
- H5（iOS Safari 和桌面浏览器）共用服务商适配。通过 `provider` 指定 `google`、`amap` 或 `tencent`，缺省读取 `VITE_LOCATION_MAP_PROVIDER`，默认 Google。
- Google 预览支持按地址搜索。高德和腾讯预览需要坐标，由 SDK 在目标点放置标记。
- 高德沿用 `VITE_AMAP_JS_KEY` 和 `VITE_AMAP_SECURITY_JS_CODE`，腾讯使用 `VITE_TENCENT_MAP_JS_KEY`。使用对应 JavaScript SDK 的浏览器配置，按服务商要求设置部署域名。缺少配置会展示未启用状态，网络或 SDK 加载失败可重试。

```vue
<LocationMap
  provider="amap"
  :location="{ latitude: 13.75, longitude: 100.5 }"
  coordinate-type="wgs84"
  country-code="TH"
/>
```
