import { Merge } from 'ts-essentials'
import { Resolver, IS_RESOLVER } from './resolver'
import type { Scope } from '../scope'
import { AbstractValues } from '../types'

type Class<T, TDependencies extends AbstractValues> = new (scope: Scope<TDependencies>) => T
type ClassResolverOptions<T, TInjectedDependencies extends AbstractValues = AbstractValues> = {
  /**
   * If true, the class is instantiated once
   * and all the subsequent resolutions return the cached value
   */
  cached?: boolean

  /**
   * Inject scope with values when resolving this dependency.
   *
   * Accepts an object, or a function that accepts scope
   * as the only argument and returns an object
   */
  inject?: TInjectedDependencies | ((scope: Scope) => TInjectedDependencies)

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

class ClassResolver<
  TValue,
  TDependencies extends AbstractValues = AbstractValues,
  TInjectedDependencies extends AbstractValues = AbstractValues,
> implements Resolver<TValue, TDependencies>
{
  readonly [IS_RESOLVER] = true

  private cache: TValue | null = null

  constructor(
    private class_: Class<TValue, Merge<TDependencies, TInjectedDependencies>>,
    private options: ClassResolverOptions<TValue, TInjectedDependencies> = {},
  ) {}

  private getDependencyProxy(scope: Scope<TDependencies>) {
    const { inject } = this.options
    const injected = typeof inject === 'function' ? inject(scope) : inject ?? Object.create(null)

    return new Proxy(scope, {
      get: (_, prop) => {
        return injected[prop] ?? scope[prop]
      },
    }) as Scope<Merge<TDependencies, TInjectedDependencies>>
  }

  resolve(scope: Scope<TDependencies>): TValue {
    const dependencyProxy = this.getDependencyProxy(scope)

    if (this.options.cached) {
      return this.cache ?? (this.cache = new this.class_(dependencyProxy))
    }

    return new this.class_(dependencyProxy)
  }

  public async dispose(scope: Scope<TDependencies>): Promise<void> {
    const { disposer, cached } = this.options

    if (disposer) {
      if (cached) {
        if (this.cache) {
          await disposer(this.cache)
        }
      } else {
        const dependencyProxy = this.getDependencyProxy(scope)
        const value = new this.class_(dependencyProxy)
        await disposer(value)
      }
    }

    this.cache = null
  }
}

export const asClass = <
  T,
  TDependencies extends AbstractValues = AbstractValues,
  TInjectedDependencies extends AbstractValues = AbstractValues,
>(
  value: Class<T, Merge<TDependencies, TInjectedDependencies>>,
  options?: ClassResolverOptions<T, TInjectedDependencies>,
): ClassResolver<T, TDependencies, TInjectedDependencies> => new ClassResolver(value, options)
