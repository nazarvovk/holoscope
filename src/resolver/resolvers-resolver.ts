import { Resolver, IS_RESOLVER } from './resolver'
import { Container, Injection, Registration } from '../types'
import { inject } from '../inject'

class ResolversResolver<T extends Container> implements Resolver<T> {
  readonly [IS_RESOLVER] = true

  private resolvers: Registration<T> = {} as Registration<T>

  constructor(injections: Injection<T>) {
    inject(this.resolvers, injections)
  }

  resolve(container: Container): T {
    return new Proxy(this.resolvers, {
      get: (resolvers, dependencyName) => {
        return resolvers[dependencyName]?.resolve?.(container)
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
