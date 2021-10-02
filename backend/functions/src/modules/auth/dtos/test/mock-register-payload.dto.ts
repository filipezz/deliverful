import Faker from 'faker'
import { RegisterPayloadDTO } from 'deliverful-types/auth/dtos'

export const mockRegisterPayloadDTO = (): RegisterPayloadDTO => ({
  email: Faker.internet.email(),
  password: Faker.internet.password()
})