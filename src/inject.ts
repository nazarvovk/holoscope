import { asValue, isResolver } from './resolver'
import type { Container, Injection } from './types'

export const inject = (target: Container, injections: Partial<Injection<Container>>) => {
  for (const [name, injection] of Object.entries(injections)) {
    const resolver = isResolver(injection) ? injection : asValue(injection)
    Object.assign(target, { [name]: resolver })
  }
}
