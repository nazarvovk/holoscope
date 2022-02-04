import { Resolver, IS_RESOLVER } from './resolver'
import type { Scope } from '../scope'
import { AbstractValues } from '../types'
import { Merge } from 'ts-essentials'

type Fn<TValue, TDependencies extends AbstractValues> = (scope: Scope<TDependencies>) => TValue
type FunctionResolverOptions<T, TInjectedDependencies extends AbstractValues = AbstractValues> = {
  /**
   * If true, the function is called once
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

class FunctionResolver<
  TValue,
  TDependencies extends AbstractValues = AbstractValues,
  TInjectedDependencies extends AbstractValues = AbstractValues,
> implements Resolver<TValue, TDependencies>
{
  readonly [IS_RESOLVER] = true

  private cache: TValue | null = null

  constructor(
    private function_: Fn<TValue, Merge<TDependencies, TInjectedDependencies>>,
    private options: FunctionResolverOptions<TValue, TInjectedDependencies> = {},
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

  public resolve(scope: Scope<TDependencies>): TValue {
    const dependencyProxy = this.getDependencyProxy(scope)

    if (this.options.cached) {
      return this.cache ?? (this.cache = this.function_(dependencyProxy))
    }

    return this.function_(dependencyProxy)
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
        const value = this.function_(dependencyProxy)
        await disposer(value)
      }
    }

    this.cache = null
  }
}

export const asFunction = <
  TValue,
  TDependencies extends AbstractValues = AbstractValues,
  TInjectedDependencies extends AbstractValues = AbstractValues,
>(
  value: Fn<TValue, Merge<TDependencies, TInjectedDependencies>>,
  options?: FunctionResolverOptions<TValue, TInjectedDependencies>,
): FunctionResolver<TValue, TDependencies, TInjectedDependencies> =>
  new FunctionResolver(value, options)
