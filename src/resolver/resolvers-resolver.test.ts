import { asFunction } from './function-resolver'
import { asResolvers } from './resolvers-resolver'

describe(`${asResolvers.name}`, () => {
  const factory1 = jest.fn(() => 1)
  const factory2 = jest.fn(() => '2')

  const container = {
    dep: 'test',
  }

  afterEach(() => jest.clearAllMocks())

  it('resolves', () => {
    const resolver = asResolvers({
      dep1: asFunction(factory1),
      dep2: asFunction(factory2),
      depValue: true,
    })

    const dependencies = resolver.resolve(container) satisfies {
      dep1: number
      dep2: string
      depValue: boolean
    }

    expect(dependencies).toMatchInlineSnapshot(`
      {
        "dep1": 1,
        "dep2": "2",
        "depValue": true,
      }
    `)
    expect(factory1).toHaveBeenCalledWith(container)
    expect(factory2).toHaveBeenCalledWith(container)
  })

  it("doesn't resolve not accessed members", () => {
    const resolver = asResolvers({
      dep1: asFunction(factory1),
      dep2: asFunction(factory2),
    })

    const dependencies = resolver.resolve(container) satisfies {
      dep1: number
      dep2: string
    }

    dependencies.dep2

    expect(factory1).not.toHaveBeenCalledWith(container)
    expect(factory2).toHaveBeenCalledWith(container)
  })

  it('resolves nested resolvers', () => {
    const resolver = asResolvers({
      dep1: asResolvers({
        dep2: asFunction(factory1),
        dep3: asFunction(factory2),
      }),
    })

    const dependencies = resolver.resolve(container) satisfies {
      dep1: {
        dep2: number
        dep3: string
      }
    }

    expect(dependencies).toMatchInlineSnapshot(`
      {
        "dep1": {
          "dep2": 1,
          "dep3": "2",
        },
      }
    `)
    expect(factory1).toHaveBeenCalledWith(container)
    expect(factory2).toHaveBeenCalledWith(container)
  })

  describe('disposer', () => {
    it('disposes resolvers', async () => {
      expect.assertions(6)

      const disposer1 = jest.fn(async () => {
        await new Promise<void>((resolve) => resolve())
        expect(1).toBe(1) // this checks that the disposer is awaited
      })
      const disposer2 = jest.fn(async () => {
        await new Promise<void>((resolve) => resolve())
        expect(2).toBe(2) // this checks that the disposer is awaited
      })
      const resolver = asResolvers({
        dep1: asFunction(factory1, {
          disposer: disposer1,
        }),
        dep2: asFunction(factory2, {
          disposer: disposer2,
        }),
      })

      resolver.resolve(container)

      await resolver.dispose(container)

      expect(factory1).toHaveBeenCalledWith(container)
      expect(factory2).toHaveBeenCalledWith(container)
      expect(disposer1).toHaveBeenCalledWith(1, container)
      expect(disposer2).toHaveBeenCalledWith('2', container)
    })
  })
})
