import { ResolutionError } from '../errors'
import { Scope } from '../scope'
import { asFunction } from './function-resolver'
import { isResolver } from './resolver'

describe(`${asFunction.name}`, () => {
  const scope = new Scope({
    test: asFunction((container: { dep: number }) => {
      return 1 + container.dep
    }),
    dep: 2,
  })

  it('is a resolver', () => {
    const resolver = asFunction(() => 1)
    expect(isResolver(resolver)).toBe(true)
  })

  it('returns value', () => {
    expect(scope.container.test).toStrictEqual(3)
  })

  it('returns different value after a dependency is changed', () => {
    scope.register({ dep: 4 })
    expect(scope.container.test).toStrictEqual(5)
  })

  describe('cache', () => {
    const fnMock = jest.fn().mockReturnValueOnce(1)

    class CacheScope extends Scope<{
      test: number
    }> {
      constructor() {
        super({
          test: asFunction(fnMock, { cached: true }),
        })
      }
    }

    const cacheScope = new CacheScope()

    it('calls function only once', () => {
      cacheScope.container.test
      cacheScope.container.test
      cacheScope.container.test

      expect(fnMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('disposer', () => {
    describe('cached', () => {
      it('calls disposer with cached value if it was accessed before', async () => {
        const fnMock = jest.fn().mockReturnValue({ test: 1 })
        const disposerMock = jest.fn()

        const disposerScope = new Scope({
          test: asFunction(fnMock, { cached: true, disposer: disposerMock }),
        })

        disposerScope.container.test

        await disposerScope.dispose()

        expect(disposerMock).toHaveBeenCalledTimes(1)
        expect(disposerMock.mock.calls[0][0]).toStrictEqual({ test: 1 })
      })

      it('clears cache and runs factory on access after dispose', async () => {
        const factoryMock = jest.fn().mockReturnValue({ test: 1 })
        const disposerMock = jest.fn()

        const disposerScope = new Scope({
          test: asFunction(factoryMock, { cached: true, disposer: disposerMock }),
        })

        // Access once and dispose
        disposerScope.container.test
        await disposerScope.dispose()

        // Access again
        disposerScope.container.test
        disposerScope.container.test // <- should not call factory again, use cache

        expect(disposerMock).toHaveBeenCalledTimes(1)
        expect(factoryMock).toHaveBeenCalledTimes(2)
      })

      it('clears cache if disposer throws error', async () => {
        const factoryMock = jest.fn().mockReturnValue({ test: 1 })
        const disposerMock = jest.fn().mockRejectedValue(new Error('disposer error'))

        const disposerScope = new Scope({
          test: asFunction(factoryMock, {
            cached: true,
            disposer: disposerMock,
          }),
        })

        // Access once and dispose
        disposerScope.container.test

        await expect(() => disposerScope.dispose()).rejects.toThrow()

        // Access again
        disposerScope.container.test
        disposerScope.container.test

        expect(disposerMock).toHaveBeenCalledTimes(1)
        expect(factoryMock).toHaveBeenCalledTimes(2)
      })

      it('does not call disposer if value was not accessed before', async () => {
        const fnMock = jest.fn()
        const disposerMock = jest.fn()

        const disposerScope = new Scope({
          test: asFunction(fnMock, { cached: true, disposer: disposerMock }),
        })

        await disposerScope.dispose()

        expect(disposerMock).not.toHaveBeenCalled()
      })
    })

    it('calls disposer with an uncached value', async () => {
      const fnMock = jest.fn().mockReturnValue({ test: 1 })
      const disposerMock = jest.fn()

      const disposerScope = new Scope({
        test: asFunction(fnMock, { disposer: disposerMock }),
      })

      disposerScope.container.test

      await disposerScope.dispose()

      expect(fnMock).toHaveBeenCalledTimes(2)
      expect(disposerMock).toHaveBeenCalledTimes(1)
      expect(disposerMock.mock.calls[0][0]).toStrictEqual({ test: 1 })
    })
  })

  describe('inject', () => {
    type InjectScopeContainer = {
      scopeDependency: number
      test: number
      invalidDependency: unknown
      injectResolverTest: number
    }

    type FnContainer = {
      scopeDependency: number
      injectedDependency: number
    }

    const addScopeDependencyToInjectedDependency = (container: FnContainer) =>
      container.scopeDependency + container.injectedDependency

    class InjectScope extends Scope<InjectScopeContainer> {
      constructor() {
        super({
          scopeDependency: 3,
          test: asFunction(addScopeDependencyToInjectedDependency, {
            inject: {
              injectedDependency: 4,
            },
          }),
          // tries to access a dependency, that is injected on the other resolver, but not present in InjectScope
          invalidDependency: asFunction((container) => container.injectedDependency),

          injectResolverTest: asFunction(addScopeDependencyToInjectedDependency, {
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
      expect(injectScope.container.test).toStrictEqual(7)
    })

    it('injected is not available to other dependencies', () => {
      expect(() => injectScope.container.invalidDependency).toThrow(ResolutionError)
    })

    it('injected resolver is called with', () => {
      expect(injectScope.container.injectResolverTest).toStrictEqual(8)
    })

    it('disposes injected resolvers', async () => {
      const disposerMock = jest.fn()

      const disposerScope = new Scope({
        test: asFunction(
          ({ injectedDependency }) => {
            // access injected dependency to make sure it has been resolved before disposal
            return injectedDependency
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

      expect(outerDep).toStrictEqual('test')
      expect(disposerMock).toHaveBeenCalledTimes(1)
      expect(disposerMock.mock.calls[0][0]).toStrictEqual('test')
    })
  })
})
