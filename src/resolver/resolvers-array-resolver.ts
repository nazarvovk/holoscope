import { Resolver, IS_RESOLVER, isResolver } from './resolver'
import { Container, Injection } from '../types'
import { asValue } from './value-resolver'

// type magic to make tuples work
class ResolversArrayResolver<T extends [...unknown[]]> implements Resolver<T> {
  readonly [IS_RESOLVER] = true

  private resolvers: Resolver<unknown>[]

  constructor(injections: Injection<[...T]>) {
    this.resolvers = injections.map((injection) => {
      return isResolver(injection) ? injection : asValue(injection)
    })
  }

  resolve(container: Container): T {
    return this.resolvers.map((resolver) => {
      return resolver.resolve(container)
    }) as T
  }

  async dispose(container: Container): Promise<void> {
    await Promise.all(this.resolvers.map((resolver) => resolver.dispose?.(container)))
  }
}

export const asResolvers = <T extends [...unknown[]]>(
  resolvers: Injection<[...T]>,
): ResolversArrayResolver<T> => new ResolversArrayResolver(resolvers)
