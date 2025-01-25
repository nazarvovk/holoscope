import { inject } from '../inject'
import { Container, ContainerOf } from '../types'
import { Resolver, IS_RESOLVER } from './resolver'

export type Factory<T> = (container: ContainerOf<T>) => T

export type FactoryResolverOptions<TValue> = {
  /**
   * If true, the factory is called once
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
  disposer?: (value: TValue, container: Container) => void | Promise<void>
} & {
  invalidateCacheOnDisposerError?: boolean
}

export const UNSET_CACHE = Symbol('UNSET_CACHE')

export class FactoryResolver<TValue> implements Resolver<TValue> {
  readonly [IS_RESOLVER] = true

  protected cache: TValue | typeof UNSET_CACHE = UNSET_CACHE

  protected injectedResolvers: Record<keyof any, Resolver<unknown>> = {}

  constructor(
    protected factory: Factory<TValue>,
    protected options: FactoryResolverOptions<TValue> = {},
  ) {
    inject(this.injectedResolvers, options.inject ?? {})
  }

  protected getInjectionProxyContainer(container: Container) {
    return new Proxy(container, {
      get: (originalContainer, dependencyName: keyof Container, proxy) => {
        if (dependencyName in this.injectedResolvers) {
          return this.injectedResolvers[dependencyName].resolve(proxy)
        }
        return originalContainer[dependencyName]
      },
    })
  }

  /**
   * Get the value of the dependency given the container.
   * Handles per-resolver inject.
   */
  protected getValue(container: Container): TValue {
    const dependencyProxy = this.getInjectionProxyContainer(container) as ContainerOf<TValue>
    return this.factory(dependencyProxy)
  }

  public resolve(container: Container): TValue {
    if (this.options.cached && this.cache !== UNSET_CACHE) {
      return this.cache
    }

    const value = this.getValue(container)

    if (this.options.cached) {
      this.cache = value
    }

    return value
  }

  public async dispose(container: Container): Promise<void> {
    try {
      const { disposer, cached } = this.options

      await Promise.all(
        Object.values(this.injectedResolvers).map((resolver) => resolver.dispose?.(container)),
      )

      if (disposer) {
        if (cached) {
          if (this.cache !== UNSET_CACHE) {
            await disposer(this.cache, container)
          }
        } else {
          const value = this.getValue(container)
          await disposer(value, container)
        }
      }
    } finally {
      this.cache = UNSET_CACHE
    }
  }
}
