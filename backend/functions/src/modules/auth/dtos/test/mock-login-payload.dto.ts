import Faker from 'faker'
import { LoginPayloadDTO } from 'deliverful-types/auth/dtos'


export const mockLoginPayloadDTO = (): LoginPayloadDTO => ({
  email: Faker.internet.email(),
  password: Faker.internet.password()
})
