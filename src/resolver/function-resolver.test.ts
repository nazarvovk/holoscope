import { Scope } from '../scope'
import { asFunction } from './function-resolver'

describe(`${Scope.name}`, () => {
  const scope: Scope<{ test: number; dep: number }> = new Scope({
    test: asFunction((scope_: Scope<{ dep: number }>) => {
      return 1 + scope_.dep
    }),
    dep: 2,
  })

  it('returns value', () => {
    expect(scope.test).toStrictEqual(3)
  })

  it('returns different value after a dependency is changed', () => {
    scope.register({ dep: 4 })
    expect(scope.test).toStrictEqual(5)
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

  describe('disposer', () => {
    it('calls disposer', async () => {
      const fnMock = jest.fn().mockReturnValueOnce({ test: 1 })
      const disposerMock = jest.fn()

      const disposerScope = new Scope({
        test: asFunction(fnMock, { cached: true, disposer: disposerMock }),
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
        test: asFunction(fnMock, { cached: true, disposer: disposerMock }),
      })

      await disposerScope.dispose()

      expect(disposerMock).not.toHaveBeenCalled()
    })

    it('calls disposer with an uncached value', async () => {
      const fnMock = jest.fn().mockReturnValue({ test: 1 })
      const disposerMock = jest.fn()

      const disposerScope = new Scope({
        test: asFunction(fnMock, { disposer: disposerMock }),
      })

      disposerScope.test

      await disposerScope.dispose()

      expect(fnMock).toHaveBeenCalledTimes(2)
      expect(disposerMock).toHaveBeenCalledTimes(1)
      expect(disposerMock).toHaveBeenCalledWith({ test: 1 })
    })
  })
})
