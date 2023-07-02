import { asCachedClass, asCachedFunction } from '.'
import { Scope } from '../scope'

describe('helpers', () => {
  class Dep2 {}
  interface MyContainer {
    dep1: string
    dep2: Dep2
  }
  const factory1 = jest.fn(() => 'dep1')
  class MyScope extends Scope<MyContainer> {
    constructor() {
      super({
        dep1: asCachedFunction(factory1),
        dep2: asCachedClass(Dep2),
      })
    }
  }
  const scope = new MyScope()

  it('should work', () => {
    expect(scope.container.dep1).toBe('dep1')
    expect(scope.container.dep2).toBeInstanceOf(Dep2)
    scope.container.dep1
    expect(factory1).toHaveBeenCalledTimes(1)
  })
})
