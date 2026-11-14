import type { GoodsEditForm } from '../models/edit'
import { goods } from '@/pages/ordering/menu/mock'

const chicken = goods.find(item => item.id === 104)?.pic ?? ''
const coffee = goods.find(item => item.id === 118)?.pic ?? ''
const fries = goods.find(item => item.id === 125)?.pic ?? ''
const noodles = goods.find(item => item.id === 108)?.pic ?? ''
const rice = goods.find(item => item.id === 101)?.pic ?? ''
const tea = goods.find(item => item.id === 102)?.pic ?? ''

export const goodsCategories = ['热销', '售罄', '主食', '小吃', '饮料', '套餐', '甜点']
const productCategories = goodsCategories.slice(2)
const products: [name: string, category: number, price: number, stock: number, sold: number, cover: string, originPrice?: number][] = [
  ['招牌套餐', 4, 28, 100, 12, chicken, 32],
  ['招牌牛肉饭', 1, 28, 46, 126, rice, 32],
  ['照烧鸡腿饭', 1, 26, 35, 184, chicken],
  ['番茄鸡蛋饭', 1, 20, 28, 87, rice],
  ['葱油拌面', 1, 18, 42, 113, noodles],
  ['鸡丝汤面', 1, 23, 0, 74, noodles],
  ['香菇鸡肉饭', 1, 24, 12, 66, rice],
  ['经典薯条', 2, 12, 52, 140, fries, 15],
  ['海盐薯条', 2, 13, 39, 64, fries],
  ['芝士薯条', 2, 16, 15, 58, fries],
  ['香辣鸡块', 2, 17, 32, 104, chicken],
  ['酥炸鸡翅', 2, 19, 0, 92, chicken],
  ['鲜柠茶', 3, 12, 80, 168, tea, 15],
  ['桂花乌龙茶', 3, 14, 27, 74, tea],
  ['冰美式', 3, 16, 60, 127, coffee],
  ['经典拿铁', 3, 20, 48, 82, coffee, 23],
  ['燕麦拿铁', 3, 22, 14, 32, coffee],
  ['蜂蜜柚子茶', 3, 15, 26, 49, tea],
  ['牛肉饭午餐套餐', 4, 36, 20, 121, rice, 42],
  ['鸡腿饭双人套餐', 4, 58, 14, 47, chicken, 68],
  ['拌面简餐套餐', 4, 27, 17, 38, noodles, 32],
  ['焦糖布丁', 5, 12, 18, 65, ''],
  ['椰奶冻', 5, 10, 0, 42, ''],
  ['芒果西米露', 5, 15, 24, 89, ''],
  ['抹茶奶酪蛋糕', 5, 22, 8, 25, ''],
]

/** 为每个门店创建独立的模拟商品记录。 */
export function createGoodsSamples() {
  return products.map(([name, category, price, stock, sold, cover, originPrice = 0], index) => {
    const form: GoodsEditForm = {
      name,
      cover,
      category,
      price,
      originPrice,
      stock,
      sold,
      status: 1,
      banners: [],
      description: '',
      attrs: [],
      tags: [],
    }
    return { id: index + 1, version: 1, category: productCategories[category - 1], form }
  })
}
