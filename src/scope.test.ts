import { Scope } from './scope'
import { asFunction, asClass } from './resolver'
import { AssignmentError, ReservedNameError } from './errors'

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

  it('throws error if you try to assign a prop', () => {
    expect(() => (scope.test = '2')).toThrowError(AssignmentError)
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

    it('overwrites a value', () => {
      scope.register({ overwritten: 'test' })
      scope.register({ overwritten: 'overwritten' })

      expect(scope.overwritten).toStrictEqual('overwritten')
    })

    it('throws error when trying to register with a reserved name', () => {
      expect(() => scope.register({ register: 'test' })).toThrow(ReservedNameError)
    })
  })

  describe('child scope', () => {
    const childScope = scope.createChildScope({
      childValue: asFunction(() => 'test'),
    })

    const child2 = childScope.createChildScope({
      secondChildTest: asFunction(() => 'childTest2'),
    })

    it('resolves own value', () => {
      expect(childScope.childValue).toStrictEqual('test')
    })

    it('resolves parent value', () => {
      expect(childScope.test).toStrictEqual(TEST_VALUE)
    })

    it('resolves twice removed parent value', () => {
      expect(child2.test).toStrictEqual(TEST_VALUE)
    })

    it('child value takes priority over parent', async () => {
      const parent = new Scope({
        test: asFunction(() => 'test'),
      })

      const child = parent.createChildScope({
        test: asFunction(() => 'childTest'),
      })

      expect(child.test).toStrictEqual('childTest')
    })

    it('disposes child scope from parent', async () => {
      const parent = new Scope({
        test: asFunction(() => 'test', { disposer: () => Promise.resolve() }),
      })

      const childTestDisposer = jest.fn().mockResolvedValueOnce(1)

      parent.createChildScope({
        childTest: asFunction(() => 'childTest', { disposer: childTestDisposer }),
      })

      await parent.dispose()

      expect(childTestDisposer).toHaveBeenCalledTimes(1)
      expect(childTestDisposer).toHaveBeenCalledWith('childTest')
    })

    it('disposes child scope without affecting parent', async () => {
      const parentTestDisposer = jest.fn().mockResolvedValueOnce(1)
      const parent = new Scope({
        test: asFunction(() => 'test', { disposer: parentTestDisposer }),
      })

      const childTestDisposer = jest.fn().mockResolvedValueOnce(1)
      const child = parent.createChildScope({
        childTest: asFunction(() => 'childTest', { disposer: childTestDisposer }),
      })

      await child.dispose()

      expect(childTestDisposer).toHaveBeenCalledTimes(1)
      expect(parentTestDisposer).not.toHaveBeenCalled()
    })
  })
})
