import { asFunction } from './function-resolver'
import { asResolvers } from './resolvers-array-resolver'

describe(`${asResolvers.name}`, () => {
  const factory1 = jest.fn(() => 1)
  const factory2 = jest.fn(() => '2')

  const container = {
    dep: 'test',
  }

  afterEach(() => jest.clearAllMocks())

  it('resolves', () => {
    const resolver = asResolvers([asFunction(factory1), asFunction(factory2), true])

    const dependencies = resolver.resolve(container) satisfies [number, string, boolean]

    expect(dependencies).toMatchInlineSnapshot(`
      [
        1,
        "2",
        true,
      ]
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
      const resolver = asResolvers([
        asFunction(factory1, {
          disposer: disposer1,
        }),
        asFunction(factory2, {
          disposer: disposer2,
        }),
      ])

      resolver.resolve(container)

      await resolver.dispose(container)

      expect(factory1).toHaveBeenCalledWith(container)
      expect(factory2).toHaveBeenCalledWith(container)
      expect(disposer1).toHaveBeenCalledWith(1, container)
      expect(disposer2).toHaveBeenCalledWith('2', container)
    })
  })
})
