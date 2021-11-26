import { Scope } from '../scope'
import { asClass } from './class-resolver'

describe(`${Scope.name}`, () => {
  class TestService {
    constructor(public scope: Scope<{ dep: number }>) {}

    plusDep(value: number) {
      return value + this.scope.dep
    }
  }

  const scope = new Scope({
    test: asClass(TestService),
    dep: 2,
  })

  it('resolves to an instance', () => {
    expect(scope.test).toBeInstanceOf(TestService)
  })

  it('returns value', () => {
    expect(scope.test.plusDep(1)).toStrictEqual(3)
  })

  it('returns different value after a dependency is changed', () => {
    const updatedScope = scope.register({ dep: 4 })

    expect(updatedScope.test.plusDep(2)).toStrictEqual(6)
  })

  describe('cache', () => {
    const ClassMock = jest.fn().mockReturnValueOnce({})
    const cacheScope = new Scope({
      test: asClass(ClassMock, { cached: true }),
    })

    it('calls function only once', () => {
      cacheScope.test
      cacheScope.test
      cacheScope.test

      expect(ClassMock).toBeCalledTimes(1)
    })
  })
})
