import Faker from 'faker'

export type AuthUserMock = {
  user: {
    uid: string
  }
  token: string
}

export function mockAuthUser(): AuthUserMock {
  return {
    user: { uid: Faker.random.alphaNumeric(32) },
    token: Faker.random.alphaNumeric(64)
  }
}