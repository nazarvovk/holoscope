import { Resolver, IS_RESOLVER } from './resolver'
import { Scope } from '../scope'

class AliasResolver<T = unknown> implements Resolver<T> {
  readonly [IS_RESOLVER] = true

  constructor(private registrationName: string) {}

  resolve<TScope extends Scope>(scope: TScope): T {
    return scope[this.registrationName] as T
  }
}

export const aliasTo = <T = unknown>(registrationName: string): AliasResolver<T> =>
  new AliasResolver(registrationName)
