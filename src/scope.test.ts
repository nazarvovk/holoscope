import { Scope } from './scope'

describe(`${Scope.name}`, () => {
  const TEST_VALUE = 'TEST_VALUE'
  const scope = new Scope({
    test: TEST_VALUE,
  })

  it('creates a scope instance', () => {
    expect(scope).toBeInstanceOf(Scope)
  })

  it('scope has the registrations', () => {
    expect(scope.test).toStrictEqual(TEST_VALUE)
  })
})
