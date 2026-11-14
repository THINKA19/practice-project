/**
 * 子功能入口（员工管理 / 修改密码 / 打印配置 / 数据备份 / 营业时段）
 * TODO 上线时改为真实页面跳转
 */
export function useShopSubPages() {
  function goPage(title: string) {
    uni.showToast({ title: `${title}（开发中）`, icon: 'none' })
  }

  return { goPage }
}
