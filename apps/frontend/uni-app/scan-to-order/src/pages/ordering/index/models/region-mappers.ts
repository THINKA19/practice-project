/** 地区接口边界校验与选择归一化；不回退到静态地区。@example toShopRegions(response) */
import type { ShopRegion, ShopRegionArea, ShopRegionSelection } from './regions'

/** 校验并复制服务端开放地区树；非法结构或重复编码拒绝加载。@param value 原始接口数据。@returns 开放地区树。@example toShopRegions([]) // [] */
export function toShopRegions(value: unknown): ShopRegion[] {
  const codes = new Set<string>()
  function node(raw: unknown): ShopRegionArea {
    if (!raw || typeof raw !== 'object' || !('code' in raw) || !('name' in raw)
      || typeof raw.code !== 'string' || !raw.code.trim() || typeof raw.name !== 'string' || !raw.name.trim() || codes.has(raw.code)) {
      throw new Error('经营地区数据格式错误')
    }
    codes.add(raw.code)
    return { code: raw.code, name: raw.name }
  }
  if (!Array.isArray(value))
    throw new Error('经营地区数据格式错误')
  return value.map((country) => {
    const base = node(country)
    if (!Array.isArray(country.cities))
      throw new Error('经营地区数据格式错误')
    return { ...base, cities: country.cities.map((city: unknown) => {
      const base = node(city)
      if (!city || typeof city !== 'object' || !('districts' in city) || !Array.isArray(city.districts))
        throw new Error('经营地区数据格式错误')
      return { ...base, districts: city.districts.map(node) }
    }) }
  })
}

/** 清除已关闭或不属于上级的筛选值。@param regions 当前开放目录。@param value 原筛选。@returns 有效筛选。@example normalizeRegionSelection([], value) // 全部为空 */
export function normalizeRegionSelection(regions: ShopRegion[], value: ShopRegionSelection): ShopRegionSelection {
  const country = regions.find(item => item.code === value.countryCode)
  const city = country?.cities.find(item => item.code === value.cityCode)
  const district = city?.districts.find(item => item.code === value.districtCode)
  return { countryCode: country?.code ?? '', cityCode: city?.code ?? '', districtCode: district?.code ?? '' }
}
