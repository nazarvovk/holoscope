import { Resolver, IS_RESOLVER } from './resolver'
import { Container } from '../types'

class AliasResolver<T = unknown> implements Resolver<T> {
  readonly [IS_RESOLVER] = true

  constructor(private registrationName: keyof Container) {}

  resolve(container: Container): T {
    return container[this.registrationName] as T
  }
}

export const aliasTo = <T = unknown>(registrationName: keyof Container): AliasResolver<T> =>
  new AliasResolver(registrationName)
