import { describe, expect, it } from 'vitest'
import { describeCartItem } from '../domain/cart.rules'
import { createCartFixture } from '../mock/fixtures/cart'
import { goods } from '../../menu/mock'

describe('购物车与结算的已选摘要', () => {
  it('结构化规格优先，不重复叠加服务端标签，保留加料与时段', () => {
    expect(describeCartItem({
      sku: [{ optionValueName: '大份' }, { optionValueName: '微辣' }],
      label: '大份 / 微辣',
      additions: [{ name: '鸡蛋' }],
      goodsTimesDay: '2026-11-02',
      goodsTimesItem: '午餐',
    })).toBe('大份·微辣·鸡蛋·2026-11-02 午餐')
  })

  it('同名选项保留原名，不额外添加分类', () => {
    expect(describeCartItem({ sku: [
      { optionName: '口味', optionValueName: '原味' },
      { optionName: '配餐', optionValueName: '原味' },
    ] })).toBe('原味·原味')
  })

  it('无结构化规格时保留标签，空选项不产生分隔符', () => {
    expect(describeCartItem({ sku: [{ optionValueName: ' ' }], label: '小份', additions: [{}] })).toBe('小份')
    expect(describeCartItem({})).toBe('')
  })

  it('加鸡蛋等原始选项名称原样保留，不额外增加符号', () => {
    expect(describeCartItem({ sku: [{ optionValueName: '大份' }], additions: [{ name: '加鸡蛋' }] })).toBe('大份·加鸡蛋')
  })

  it('初始购物车图片与菜单同一商品一致', () => {
    const item = createCartFixture().items[0]
    expect(item.pic).toBe(goods.find(product => product.id === item.goodsId)?.pic)
    expect(item.pic).not.toBe('/static/logo.png')
  })
})
