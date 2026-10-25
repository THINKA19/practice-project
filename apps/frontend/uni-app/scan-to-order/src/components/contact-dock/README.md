# ContactDock

公共入口：从 @/components/contact-dock 导入 ContactDock 与 ContactItem。

- index.vue：装配与按钮展示。
- models/contact.ts：ContactItem 与复制/链接操作类型。
- composables/useContactDock.ts：展开、详情弹窗、复制及平台链接处理。
- components/WechatContactPopup.vue：联系方式详情弹窗。

必传 contacts: ContactItem[]，支持复制联系方式和打开外链；可选 hint 展示配置说明。具体业务账号、名称和样式由调用页面提供，组件不内置账号。通用文案使用 contactDock 语言资源。使用现有 Wot 字体图标。

H5 直接打开新标签；App 通过平台能力打开链接；其他端复制链接。无网络请求或持久化。服务页提供演示账号，非真实客服渠道。
