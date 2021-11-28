import { Scope } from './scope'
import { asFunction, asClass } from './resolver'

describe(`${Scope.name}`, () => {
  const TEST_VALUE = 'TEST_VALUE'
  const scope: Scope<{ test: string }> = new Scope({
    test: TEST_VALUE,
  })

  it('creates a scope instance', () => {
    expect(scope).toBeInstanceOf(Scope)
  })

  it('scope has the registrations', () => {
    expect(scope.test).toStrictEqual(TEST_VALUE)
  })

  it('scope calls all disposers', async () => {
    const disposer1 = jest.fn()
    const disposer2 = jest.fn()
    const disposer3 = jest.fn()

    class Test2 {}

    const scope = new Scope({
      test1: asFunction(() => 1, { disposer: disposer1 }),
      test2: asClass(Test2, { disposer: disposer2 }),
      test3: asFunction(() => 1, { cached: true, disposer: disposer3 }),
      test4: 'raw_value',
    })

    await scope.dispose()

    expect(disposer1).toHaveBeenCalledTimes(1)
    expect(disposer2).toHaveBeenCalledTimes(1)
    expect(disposer3).not.toHaveBeenCalled()
  })

  describe('register', () => {
    scope.register({ newValue: 'test' })

    it('registers value', () => {
      expect(scope.newValue).toStrictEqual('test')
    })
  })
})
