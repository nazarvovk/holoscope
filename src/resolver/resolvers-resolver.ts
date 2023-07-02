import { Resolver, IS_RESOLVER } from './resolver'
import { Container, Injection } from '../types'
import { inject } from '../inject'

class ResolversResolver<T extends Container> implements Resolver<T> {
  readonly [IS_RESOLVER] = true

  private resolvers = {} as Record<keyof any, Resolver<unknown>>

  constructor(injections: Injection<T>) {
    inject(this.resolvers, injections)
  }

  resolve(container: Container): T {
    return new Proxy(this.resolvers, {
      get: (resolvers, dependencyName) => {
        return resolvers[dependencyName as keyof T]?.resolve?.(container)
      },
    }) as T
  }

  async dispose(container: Container): Promise<void> {
    await Promise.all(
      Object.values(this.resolvers).map((resolver) => resolver.dispose?.(container)),
    )
  }
}

export const asResolvers = <T extends Container>(resolvers: Injection<T>) =>
  new ResolversResolver<T>(resolvers)
