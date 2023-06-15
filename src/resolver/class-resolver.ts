import { Container } from '../types'
import { FactoryResolver, FactoryResolverOptions } from './factory-resolver'

export type Class<TValue> = new (...args: any[]) => TValue

export const asClass = <TValue>(class_: Class<TValue>, options?: FactoryResolverOptions<TValue>) =>
  new FactoryResolver((c: Container) => new class_(c), options)
