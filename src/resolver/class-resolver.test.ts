import { Scope } from '../scope'
import { asClass } from './class-resolver'

describe(`${asClass.name}`, () => {
  class TestService {
    constructor(public scope: Scope<{ dep: number }>) {}

    plusDep(value: number) {
      return value + this.scope.dep
    }
  }

  const scope: Scope<{ test: TestService; dep: number }> = new Scope({
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
    scope.register({ dep: 4 })

    expect(scope.test.plusDep(2)).toStrictEqual(6)
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

  describe('disposer', () => {
    it('calls disposer', async () => {
      const fnMock = jest.fn().mockReturnValueOnce({ test: 1 })
      const disposerMock = jest.fn()

      const disposerScope = new Scope({
        test: asClass(fnMock, { cached: true, disposer: disposerMock }),
      })

      disposerScope.test

      await disposerScope.dispose()

      expect(disposerMock).toHaveBeenCalledTimes(1)
      expect(disposerMock).toHaveBeenCalledWith({ test: 1 })
    })

    it('does not call disposer if value was not resolved', async () => {
      const fnMock = jest.fn()
      const disposerMock = jest.fn()

      const disposerScope = new Scope({
        test: asClass(fnMock, { cached: true, disposer: disposerMock }),
      })

      await disposerScope.dispose()

      expect(disposerMock).not.toHaveBeenCalled()
    })

    it('calls disposer with an uncached value', async () => {
      const fnMock = jest.fn().mockReturnValue({ test: 1 })
      const disposerMock = jest.fn()

      const disposerScope = new Scope({
        test: asClass(fnMock, { disposer: disposerMock }),
      })

      disposerScope.test

      await disposerScope.dispose()

      expect(fnMock).toHaveBeenCalledTimes(2)
      expect(disposerMock).toHaveBeenCalledTimes(1)
      expect(disposerMock).toHaveBeenCalledWith({ test: 1 })
    })
  })

  describe('inject', () => {
    type ClassScope = InjectTestScope & { injectedDependency: number }

    class TestClass {
      constructor(public scope: ClassScope) {}
    }
    type InjectTestScope = {
      test: TestClass
      testInjectFunction: TestClass
    }

    const injectScope: Scope<InjectTestScope> = new Scope({
      test: asClass(TestClass, {
        inject: {
          injectedDependency: 4,
        },
      }),
      testInjectFunction: asClass(TestClass, {
        inject: () => ({
          injectedDependency: 6,
        }),
      }),
    })

    it('injects dependency into the resolver', () => {
      expect(injectScope.test.scope.injectedDependency).toStrictEqual(4)
      expect(injectScope.testInjectFunction.scope.injectedDependency).toStrictEqual(6)
    })
  })
})
