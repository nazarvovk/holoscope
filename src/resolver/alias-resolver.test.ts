import { Scope } from '../scope'
import { asFunction } from './function-resolver'
import { aliasTo } from './alias-resolver'

describe(`${aliasTo.name}`, () => {
  const fn = jest.fn().mockReturnValue(1)

  const scope = new Scope({
    test: asFunction(fn),
    alias: aliasTo<number>('test'),
  })

  it('returns aliased value', () => {
    expect(scope.container.alias).toStrictEqual(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
