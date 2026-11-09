# phone-input

多国电话输入组件，当前用于收货地址和自取联系电话。目录及模板标签使用 `phone-input`。

- `index.vue` 声明组件接口、组合 Hook、渲染模板和局部样式。
- `use-phone-input.ts` 管理当前组件实例的输入同步、区号弹层、聚焦/失焦及校验提示时机。
- `src/utils/project/phone.ts` 保存国家区号和纯格式规则；地址保存、订单提交和组件 Hook 共用，不依赖视图。
- `types.ts` 定义 Props、事件及暴露的校验接口；`index.ts` 是组件公共入口。

```vue
<phone-input
  v-model="mobile"
  v-model:country="phoneCountry"
  :required="false"
  :disabled="submitting"
/>
```

`country` 为国家代码，默认 VN。电话国家独立于配送国家；组件不读取账号、门店或地址状态，也不保存业务数据。必填表单通过组件暴露的 `validate()` 校验；选填空值通过，非空值必须合法。仅检查现有国家配置下的基础格式，不验证号码归属、开通或短信可达性。

保存前从 `@/utils/project/phone` 导入并调用 `internationalPhone(value, country)` 转换为带 `+` 的国际号码，非法值返回 null。输入时保留用户原始文本，不在每次按键时添加区号或删除前导零。未知区号不会被当作有效号码。

所有调用位置统一展示国家、区号和小下拉折角，整个入口可点击选择；不提供页面专用样式分支，不再显示额外的“切换”文字。
