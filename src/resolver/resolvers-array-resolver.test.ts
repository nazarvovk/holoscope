import { asFunction } from './function-resolver'
import { asResolvers } from './resolvers-array-resolver'

describe(`${asResolvers.name}`, () => {
  it('resolves', () => {
    const factory1 = jest.fn(() => 1)
    const factory2 = jest.fn(() => '2')
    const resolver = asResolvers([asFunction(factory1), asFunction(factory2), true])

    const container = {
      dep: 'test',
    }

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
})
