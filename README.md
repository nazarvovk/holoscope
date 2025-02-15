# <img src='holoscope-logo.svg' height='64' alt='Holoscope Logo' style="display: flex;align-items: center;"/>


[![npm version](https://img.shields.io/npm/v/holoscope.svg?maxAge=1000)](https://www.npmjs.com/package/holoscope)
[![Test](https://github.com/nazarvovk/holoscope/actions/workflows/test.yml/badge.svg)](https://github.com/nazarvovk/holoscope/actions/workflows/test.yml)
[![npm downloads](https://img.shields.io/npm/dt/holoscope.svg?maxAge=1000)](https://www.npmjs.com/package/holoscope)
[![license](https://img.shields.io/npm/l/holoscope.svg?maxAge=1000)](https://github.com/nazarvovk/holoscope/blob/master/LICENSE.md)

Dependency injection tool for Typescript projects.

Inspired by [Awilix](https://github.com/jeffijoe/awilix) and AWS CDK [Constructs](https://docs.aws.amazon.com/cdk/v2/guide/constructs.html).

## Installation

With npm:
```bash
npm install holoscope
```

## Getting Started

> If you're familiar with [Awilix](https://github.com/jeffijoe/awilix) or similar IoC libraries, you should check out [this section](#comparison-with-awilix)

Holoscope has two key concepts: `Scopes` and `Resolvers`. You wrap your dependencies _(service classes, configuration objects, etc)_ in an appropriate resolver and pass them to a `Scope`, which manages passing peer dependencies to each resolver. Take this simple example:

```typescript
import { asClass, Scope } from 'holoscope'

class PostService {
  constructor(private container: { database: Database }) {}
  async getPosts() {
    return this.container.database.posts.getAll()
  }
}

const scope = new Scope({
  database: asClass(Database, { cached: true }),
  postService: asClass(PostService, { cached: true }),
})

const posts = await scope.container.postService.getPosts()
```

`Scope.container` is a proxy that handles dependency resolution at access-time. It is passed to each resolver's `resolve` method. `asFunction` and `asClass` resolvers pass the container to the provided factory function or class respectively.

In the example above, the `database` is instantiated inside the `getPosts` method of `PostService`. After that, it gets cached, and reused in any subsequent access through the container.

> Note: values that are not a `Resolver` are wrapped in `asValue()` at registration. This allows to register plain values without wrapping them.
> 
> If you want to create your own resolver with custom logic, [look here.](#custom-resolvers)

## Building your scopes

The `Scope` class should be extended to build your scopes:

```typescript
type GeneralContainer = {
  database: Database
  postService: PostService
}

class GeneralScope extends Scope<GeneralContainer> {
  constructor() {
    super({
      database: asClass(Database, { cached: true }),
      postService: asClass(PostService, { cached: true }),
    })
  }
}

const scope = new GeneralScope()
```

### Extending scopes

Notice that the values in the container type provided to scope's generic parameter _(`GeneralContainer` above)_ don't have to be specific implementations, but interfaces instead.
This allows to extend and swap out the dependencies:

```typescript
class DevelopmentScope extends GeneralScope {
  constructor() {
    super()
    this.register({
      // DevelopmentDatabase satisfies Database
      database: asClass(DevelopmentDatabase, { cached: true }),
    })
  }
}
```

### Expanding scopes

To expand a scope (extend and add dependencies, not just swap them out), consider using `ExtendedInjection` generic type as a constructor input in the following pattern:

```typescript
interface BaseContainer {
  name: string
}

class BaseScope<TExtended extends ExampleContainer> extends Scope<TExtended> {
  constructor(extended: ExtendedInjection<ExampleContainer, TExtended>) {
    const registrations: Injection<ExampleContainer> = {
    }
    super({
      name: 'example',
      ...extended,
    } as Injection<TExtended>)
  }
}

class ExtendedScope extends BaseScope<ExtendedContainer> {
  constructor() {
    super({
      greeting: asFunction(({ name }) => `Hello, ${name}!`),
    })
  }
}

new ExtendedScope().container.greeting // 'Hello, World!'
```

## Disposing scopes and their resolvers

For `asFunction` and `asClass` resolvers _(as well as possibly for [custom resolvers](#custom-resolvers)),_ there is an option to provide a `disposer` function.

`Scope.dispose()` is an async method, which internally awaits every resolver's disposer. 
This is useful to close database connections, write logs, etc. at the end of a process.

> For `asFunction` and `asClass` resolvers with `cached: true`, disposers are only called if the dependency was resolved before.

## Comparison with [Awilix](https://github.com/jeffijoe/awilix)

- Different terminology for similar concepts/types: `awilix.Container -> holoscope.Scope`; `awilix.Container.cradle -> holoscope.Scope.container`.
- All registration must be provided at `Scope` init, ensuring type-safety.
- Factory resolvers (`asFunction`, `asClass`) are not bound to the scope. Cache is handled inside the resolvers themselves.
- No auto-loading modules.
- Instead of "child" containers, scopes can be extended, overwriting and adding new dependencies in a flat internal structure.

## Built-in resolvers and helper functions

Holoscope includes the following general-purpose resolvers:

  - `asValue` - used internally to wrap non-resolver values. Can be used explicitly.
  - `asFunction`, `asClass` - factory resolvers. Optionally handle cache and disposing. Allow injecting per-dependency peers with `inject` option.
  - `aliasTo` - returns a dependency of a passed name from the container. _Beware recursive loops - do not pass the name this resolver is registered itself._
  - `asResolvers` - pass an object of resolvers. Used to nest dependencies.

There are also helper functions `asCachedFunction` and `asCachedClass`, that are simple shorthands for `as___(factory, { cached: true })`

## Custom resolvers

You can create your own resolvers with custom logic, e.g.:

```typescript
import { Container, IS_RESOLVER, Resolver } from 'holoscope'
class CustomResolver<T = unknown> implements Resolver<T> {
  readonly [IS_RESOLVER] = true
  resolve(container: Container): T {
    // custom logic, that returns T
  }
}
```

Resolvers have to:
  - have a `resolve` method that accepts a container and returns the value
  - have `IS_RESOLVER` property set to `true`. Resolver doesn't necessarily have to be a class instance.
    > NOTE: `IS_RESOLVER` is a Symbol imported from the library — this prevents prop name conflicts. Make sure you are setting `[IS_RESOLVER] = true` and not `IS_RESOLVER = true`.

A resolver can have an optional `dispose` method that accepts the entire container. However, it is recommended to only interact with the dependency the resolver represents in custom disposers, to avoid accessing a peer dependency after it already was disposed.

## API Reference

TODO

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.