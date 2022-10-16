import { Container } from '../types'
import { Resolver, IS_RESOLVER } from './resolver'

type Class<TValue> = new (...args: any[]) => TValue
type ClassResolverOptions<T> = {
  /**
   * If true, the class is instantiated once
   * and all the subsequent resolutions return the cached value
   */
  cached?: boolean

  /**
   * Inject the container with values when resolving this dependency.
   */
  inject?: Record<string | symbol, unknown>

  /**
   * Function that is called when the scope is disposed.
   * Accepts the value as the only argument.
   *
   * If `cached` is true, disposer is called only if value was resolved before.
   *
   * If disposer returns a Promise, it is awaited.
   */
  disposer?: (value: T) => void | Promise<void>
}

class ClassResolver<TValue> implements Resolver<TValue> {
  readonly [IS_RESOLVER] = true

  private cache: TValue | null = null

  constructor(private class_: Class<TValue>, private options: ClassResolverOptions<TValue> = {}) {}

  private getInjectionProxyContainer(container: Container) {
    const { inject } = this.options
    if (!inject) {
      return container
    }

    return new Proxy(container, {
      get: (originalContainer, dependencyName: keyof Container) => {
        // using Object.hasOwn so that if inject overwrites a dependency with undefined or null,
        // that injected value is returned
        return Object.hasOwn(inject, dependencyName)
          ? inject[dependencyName]
          : originalContainer[dependencyName]
      },
    })
  }

  public getValue(container: Container): TValue {
    const dependencyProxy = this.getInjectionProxyContainer(container)
    return new this.class_(dependencyProxy)
  }

  public resolve(container: Container): TValue {
    if (this.options.cached && this.cache) {
      return this.cache
    }

    const value = this.getValue(container)

    if (this.options.cached) {
      this.cache = value
    }

    return value
  }

  public async dispose(container: any): Promise<void> {
    const { disposer, cached } = this.options

    if (disposer) {
      if (cached) {
        if (this.cache) {
          await disposer(this.cache)
        }
      } else {
        const dependencyProxy = this.getInjectionProxyContainer(container)
        const value = new this.class_(dependencyProxy)
        await disposer(value)
      }
    }

    this.cache = null
  }
}

export const asClass = <TValue>(
  value: Class<TValue>,
  options?: ClassResolverOptions<TValue>,
): ClassResolver<TValue> => new ClassResolver(value, options)
