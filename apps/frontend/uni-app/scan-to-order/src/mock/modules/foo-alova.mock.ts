import { defineMock } from '@alova/mock'
import { createFoo } from '../generators'
import { ok } from '../utils/response'
import { withFailure } from '../utils/scenario'

/** 对应 api/foo-alova.ts；唯一示例，后续业务模块按同样方式扩展。 */
export default defineMock({
  '[GET]/foo': withFailure(() => ok(createFoo())),
})
