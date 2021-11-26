import { Scope } from '../scope'
import { asFunction } from './function-resolver'

describe(`${Scope.name}`, () => {
  const scope = new Scope({
    test: asFunction((container: Scope<{ dep: number }>) => {
      return 1 + container.dep
    }),
    dep: 2,
  })

  it('returns value', () => {
    expect(scope.test).toStrictEqual(3)
  })

  it('returns different value after a dependency is changed', () => {
    const updatedScope = scope.register({ dep: 4 })
    expect(updatedScope.test).toStrictEqual(5)
  })

  describe('cache', () => {
    const fnMock = jest.fn().mockReturnValueOnce(1)
    const cacheScope = new Scope({
      test: asFunction(fnMock, { cached: true }),
    })

    it('calls function only once', () => {
      cacheScope.test
      cacheScope.test
      cacheScope.test

      expect(fnMock).toBeCalledTimes(1)
    })
  })
})
