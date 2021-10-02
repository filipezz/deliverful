import Faker from 'faker'
import { AuthPayloadDTO } from 'deliverful-types/auth/dtos'

export const mockAuthPayloadDTO = (): AuthPayloadDTO => ({
  uid: Faker.random.uuid(),
  token: {
    accessToken: Faker.random.alphaNumeric(64),
    refreshToken: Faker.random.alphaNumeric(64),
    expirationTime: Faker.random.number()
  }
})