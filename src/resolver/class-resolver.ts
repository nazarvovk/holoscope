import { Container } from '../types'
import { FactoryResolver, FactoryResolverOptions } from './factory-resolver'

type Class<TValue> = new (...args: any[]) => TValue
type FunctionResolverOptions<TValue> = FactoryResolverOptions<TValue>

export const asClass = <TValue>(class_: Class<TValue>, options?: FunctionResolverOptions<TValue>) =>
  new FactoryResolver((c: Container) => new class_(c), options)
