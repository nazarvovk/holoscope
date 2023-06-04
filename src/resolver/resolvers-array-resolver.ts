import { Resolver, IS_RESOLVER, isResolver } from './resolver'
import { Container, Injection } from '../types'

// type magic to make tuples work
class ResolversArrayResolver<T extends [...unknown[]]> implements Resolver<T> {
  readonly [IS_RESOLVER] = true

  constructor(private resolvers: Injection<[...T]>) {}

  resolve(container: Container): T {
    return this.resolvers.map((resolverOrValue) => {
      if (isResolver(resolverOrValue)) {
        return resolverOrValue.resolve(container)
      }
      return resolverOrValue
    }) as T
  }

  async dispose(container: Container): Promise<void> {
    await Promise.all(
      this.resolvers.map(async (resolverOrValue) => {
        if (isResolver(resolverOrValue)) {
          await resolverOrValue.dispose?.(container)
        }
      }),
    )
  }
}

export const asResolvers = <T extends [...unknown[]]>(
  resolvers: Injection<[...T]>,
): ResolversArrayResolver<T> => new ResolversArrayResolver(resolvers)
