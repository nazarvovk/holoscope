import { Resolver } from './resolver'

export type AbstractValues = Record<string | symbol, unknown>

export type ResolverPairs<T extends AbstractValues> = {
  [K in keyof T]: T[K] extends Resolver<T[K]> ? T[K] : Resolver<T[K]>
}

export type ResolverOrValueRecord<T extends AbstractValues> = {
  [K in keyof T]: T[K] | Resolver<T[K]>
}
