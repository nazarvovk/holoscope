import type { Container, Injection, Registration } from './types'
import { Resolver } from './resolver'
import { ResolutionError } from './errors'
import { inject } from './inject'

/**
 * Scope that allows dependency injection.
 * @param registrations Record of values that can either be a raw value or a resolver
 */
export class Scope<TContainer extends Container = Container> {
  public registrations = {} as Registration<TContainer>
  private protectedRegistrations = {} as Injection<any>

  constructor(registrations: Injection<TContainer>) {
    this.register(registrations)
  }

  /**
   * Public container proxy.
   */
  public container = new Proxy(this.registrations, {
    get: (registrations, dependencyName) => {
      if (dependencyName === '$$typeof') return Symbol.for('holoscope.container')
      if (!(dependencyName in registrations)) {
        throw new ResolutionError(dependencyName)
      }
      return registrations[dependencyName].resolve(this.resolutionContainerProxy)
    },
  }) as TContainer

  /**
   * Container that is passed when resolving dependencies from other dependencies
   * Differs from container, prioritizing protected registrations
   */
  private resolutionContainerProxy = new Proxy(this.container, {
    get: (registrations, dependencyName: any, proxy) => {
      if (dependencyName in this.protectedRegistrations) {
        return this.protectedRegistrations[dependencyName].resolve(proxy)
      }
      return this.container[dependencyName]
    },
  })

  public register(injection: Partial<Injection<TContainer>>): Scope<TContainer> {
    inject(this.registrations, injection)
    return this
  }

  public registerProtected(protectedInjection: Injection<unknown>): Scope<TContainer> {
    inject(this.protectedRegistrations, protectedInjection)
    return this
  }

  /**
   * Call all of the resolver disposers.
   */
  async dispose(): Promise<void> {
    await Promise.all(
      [...Object.values(this.registrations), ...Object.values(this.protectedRegistrations)].map(
        (resolver: Resolver<unknown>) => resolver.dispose?.(this.resolutionContainerProxy),
      ),
    )
  }
}
