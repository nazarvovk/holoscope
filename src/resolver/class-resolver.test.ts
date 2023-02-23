import { Scope } from '../scope'
import { asClass } from './class-resolver'
import { asFunction } from './function-resolver'

describe(`${asClass.name}`, () => {
  class TestService {
    constructor(public container: { dep: number }) {}

    plusDep(value: number) {
      return value + this.container.dep
    }
  }

  const scope = new Scope({
    test: asClass(TestService),
    dep: 2,
  })

  it('resolves to an instance', () => {
    expect(scope.container.test).toBeInstanceOf(TestService)
  })

  it('returns value', () => {
    expect(scope.container.test.plusDep(1)).toStrictEqual(3)
  })

  it('returns different value after a dependency is changed', () => {
    scope.register({ dep: 4 })

    expect(scope.container.test.plusDep(2)).toStrictEqual(6)
  })

  describe('cache', () => {
    const ClassMock = jest.fn().mockReturnValueOnce({})
    const cacheScope = new Scope({
      test: asClass(ClassMock, { cached: true }),
    })

    it('calls function only once', () => {
      cacheScope.container.test
      cacheScope.container.test
      cacheScope.container.test

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

      disposerScope.container.test

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

      disposerScope.container.test

      await disposerScope.dispose()

      expect(fnMock).toHaveBeenCalledTimes(2)
      expect(disposerMock).toHaveBeenCalledTimes(1)
      expect(disposerMock).toHaveBeenCalledWith({ test: 1 })
    })
  })

  describe('inject', () => {
    type TestClassContainer = {
      scopeDependency: number
      injectedDependency: number
    }

    class TestClass {
      value: number

      constructor(public container: TestClassContainer) {
        this.value = container.scopeDependency + container.injectedDependency
      }
    }

    class InjectResolverTestClass {
      value: number

      constructor(public container: TestClassContainer & { dep: number }) {
        this.value = container.scopeDependency + container.injectedDependency
      }
    }

    type InjectTestContainer = {
      test: TestClass
      scopeDependency: number
      injectResolverTest: InjectResolverTestClass
    }

    class InjectScope extends Scope<InjectTestContainer> {
      constructor() {
        super({
          scopeDependency: 3,
          test: asClass(TestClass, {
            inject: {
              injectedDependency: 4,
            },
          }),
          injectResolverTest: asClass(InjectResolverTestClass, {
            inject: {
              injectedDependency: asFunction(
                ({ scopeDependency, dep }) =>
                  // sum of outer scope dependency and dependency injected at the same level
                  // should be 5
                  scopeDependency + dep,
              ),
              dep: 2,
            },
          }),
        })
      }
    }

    let injectScope: InjectScope

    beforeEach(() => {
      injectScope = new InjectScope()
    })

    it('injects dependency into the resolver', () => {
      expect(injectScope.container.test.value).toStrictEqual(7)
    })

    it('injected resolver is called with', () => {
      expect(injectScope.container.injectResolverTest.value).toStrictEqual(8)
    })

    it('disposes injected resolvers', async () => {
      const disposerMock = jest.fn()

      const disposerScope = new Scope({
        test: asClass(
          class C {
            val: string
            constructor(public container: { injectedDependency: string }) {
              // access injected dependency to make sure it has been resolved before disposal
              this.val = container.injectedDependency
            }
          },
          {
            inject: {
              injectedDependency: asFunction(() => 'test', {
                cached: true,
                disposer: disposerMock,
              }),
            },
          },
        ),
      })

      const outerDep = disposerScope.container.test

      await disposerScope.dispose()

      expect(outerDep.val).toStrictEqual('test')
      expect(disposerMock).toHaveBeenCalledTimes(1)
      expect(disposerMock).toHaveBeenCalledWith('test')
    })
  })
})
