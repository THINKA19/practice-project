/**
 * 桌台页面级操作：区域管理 / 新增桌台 / 批量打印
 * TODO 上线时对接真实接口与打印机 SDK
 */
export function useTableAdmin() {
  function manageArea() {
    uni.showToast({ title: '区域管理（开发中）', icon: 'none' })
  }

  function addTable() {
    uni.showToast({ title: '新增桌台（开发中）', icon: 'none' })
  }

  function batchPrint() {
    uni.showToast({ title: '批量打印桌台码（开发中）', icon: 'none' })
  }

  return { manageArea, addTable, batchPrint }
}
