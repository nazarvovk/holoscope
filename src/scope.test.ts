import { Scope } from './scope'
import { asFunction, asClass } from './resolver'
import { Container, ExtendedInjection, Injection } from './types'

describe(`${Scope.name}`, () => {
  const TEST_VALUE = 'TEST_VALUE'

  interface TestContainer extends Container {
    test: string
  }

  class TestScope<TExtended extends TestContainer = TestContainer> extends Scope<TExtended> {
    constructor(extended: ExtendedInjection<TestContainer, TExtended>) {
      const registrations: Injection<TestContainer> = {
        test: asFunction(() => TEST_VALUE),
      }
      super({
        ...registrations,
        ...extended,
      } as Injection<TExtended>)
    }
  }

  const scope = new TestScope()

  it('creates a scope instance', () => {
    expect(scope).toBeInstanceOf(Scope)
  })

  it('scope has the registrations', () => {
    expect(scope.container.test).toStrictEqual(TEST_VALUE)
  })

  it('scope calls all disposers', async () => {
    const disposer1 = jest.fn()
    const disposer2 = jest.fn()
    const disposer3 = jest.fn()

    class TestClass {}

    class TestDisposableScope extends Scope<{
      test1: number
      test2: TestClass
      test3: number
    }> {
      constructor() {
        super({
          test1: asFunction(() => 1, { disposer: disposer1 }),
          test2: asClass(TestClass, { disposer: disposer2 }),
          test3: asFunction(() => 1, { cached: true, disposer: disposer3 }),
        })
      }
    }

    const disposableScope = new TestDisposableScope()

    await disposableScope.dispose()

    expect(disposer1).toHaveBeenCalledTimes(1)
    expect(disposer2).toHaveBeenCalledTimes(1)
    expect(disposer3).not.toHaveBeenCalled()
  })

  describe.each([false, null, undefined, 0, '', NaN])('falsy registrations', (falsyValue) => {
    it('handles falsy registrations', () => {
      const falsyScope = new Scope({
        falsyValue,
      })

      expect(() => falsyScope.container.falsyValue).not.toThrow()
      expect(falsyScope.container.falsyValue).toStrictEqual(falsyValue)
    })

    it('handles falsy protected registrations', () => {
      const falsyScope = new Scope({
        publicValue: asFunction(({ falsyValue }) => falsyValue),
      }).registerProtected({ falsyValue })

      expect(() => falsyScope.container.publicValue).not.toThrow()
      expect(falsyScope.container.publicValue).toStrictEqual(falsyValue)
    })
  })

  describe('register', () => {
    const scope = new Scope({
      value: 'test',
      overwriteTest: 'init',
    })

    it('registers value', () => {
      expect(scope.container.value).toStrictEqual('test')
    })

    it('overwrites a value', () => {
      expect(scope.container.overwriteTest).toStrictEqual('init')

      scope.register({ overwriteTest: 'overwritten' })
      expect(scope.container.overwriteTest).toStrictEqual('overwritten')
    })
  })

  describe('extended scope', () => {
    interface ChildContainer extends TestContainer {
      childValue: string
    }
    class ChildScope<TExtended extends ChildContainer> extends TestScope<TExtended> {
      constructor(extraRegistrations: ExtendedInjection<ChildContainer, TExtended>) {
        // type check own registrations
        const registrations: Injection<Omit<ChildContainer, keyof TestContainer>> = {
          childValue: 'test',
        }
        super({
          ...registrations,
          ...extraRegistrations,
        } as Injection<TExtended>)
      }
    }

    const childScope = new ChildScope()

    interface GrandChildContainer extends ChildContainer {
      grandChildValue: string
    }
    class GrandChildScope extends ChildScope<GrandChildContainer> {
      constructor() {
        super({
          grandChildValue: asFunction(() => 'grandChildValue'),
        })
      }
    }

    const grandChild = new GrandChildScope()

    it('resolves own value', () => {
      expect(childScope.container.childValue).toStrictEqual('test')
    })

    it('resolves parent value', () => {
      expect(childScope.container.test).toStrictEqual(TEST_VALUE)
    })

    it('resolves twice removed parent value', () => {
      expect(grandChild.container.test).toStrictEqual(TEST_VALUE)
      expect(grandChild.container.grandChildValue).toStrictEqual('grandChildValue')
    })

    it('child value overwrites parent', async () => {
      const overwriteValue = 'overwriteValue'
      class ChildScope extends TestScope {
        constructor() {
          super({
            test: overwriteValue,
          })
        }
      }

      const child = new ChildScope()

      expect(child.container.test).toStrictEqual(overwriteValue)
    })

    it('disposes child scope from parent', async () => {
      const childTestDisposer = jest.fn().mockResolvedValueOnce(1)
      class ChildScope extends TestScope<ChildContainer> {
        constructor() {
          super({
            childValue: asFunction(() => 'childTest', {
              disposer: childTestDisposer,
            }),
          })
        }
      }

      const parent = new ChildScope()

      await parent.dispose()

      expect(childTestDisposer).toHaveBeenCalledTimes(1)
      expect(childTestDisposer.mock.calls[0][0]).toStrictEqual('childTest')
    })

    it('disposes both parent & child registrations', async () => {
      const parentTestDisposer = jest.fn().mockResolvedValueOnce(1)

      class BaseScope<TExtended extends TestContainer> extends Scope<TExtended> {
        constructor(extended: ExtendedInjection<TestContainer, TExtended>) {
          super({
            test: asFunction(() => 'test', { disposer: parentTestDisposer }),
            ...extended,
          } as Injection<TExtended>)
        }
      }

      const childTestDisposer = jest.fn().mockResolvedValueOnce(1)
      class ExtendedScope extends BaseScope<ChildContainer> {
        constructor() {
          super({
            childValue: asFunction(() => 'childTest', {
              disposer: childTestDisposer,
            }),
          })
        }
      }
      const child = new ExtendedScope()

      await child.dispose()

      expect(childTestDisposer).toHaveBeenCalledTimes(1)
      expect(parentTestDisposer).toHaveBeenCalledTimes(1)
    })
  })

  describe('protected registrations', () => {
    // This is useful when there are registrations that
    // depend on protectedValue, but at the same time protectedValue
    // is not part of the container type (should not be accessible from the outside)

    class ProtectedScope extends Scope<{ getterValue: string }> {
      constructor() {
        super({
          getterValue: asFunction(
            ({ protectedValue }: { protectedValue: string }) => protectedValue,
          ),
        })

        this.registerProtected({
          protectedValue: 'protectedValue',
        })
      }
    }

    const protectedScope = new ProtectedScope()

    it('resolves protected value', () => {
      expect(protectedScope.container.getterValue).toStrictEqual('protectedValue')
    })

    it('protected value is not available from outside', () => {
      // @ts-expect-error shouldn't be available
      expect(() => protectedScope.container.protectedValue).toThrow(
        'No registration "protectedValue".',
      )
    })

    it('disposes protected value', async () => {
      const protectedValueDisposer = jest.fn().mockResolvedValueOnce(1)

      class ProtectedScope extends Scope<{ getter: string }> {
        constructor() {
          super({
            getter: asFunction(({ protectedValue }) => protectedValue),
          })

          this.registerProtected({
            protectedValue: asFunction(() => 'protected', {
              cached: true,
              disposer: protectedValueDisposer,
            }),
          })
        }
      }

      const protectedScope = new ProtectedScope()

      protectedScope.container.getter

      await protectedScope.dispose()

      expect(protectedValueDisposer).toHaveBeenCalledTimes(1)
      expect(protectedValueDisposer.mock.calls[0][0]).toStrictEqual('protected')
    })
  })
})
