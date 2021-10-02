import Faker from 'faker'
import { SaveUserDriverDTO } from 'deliverful-types/drivers/dtos'

export const mockSaveUserDriverDTO = (): SaveUserDriverDTO => ({
  license: {
    number: Faker.random.alphaNumeric(11),
    issuedDate: Faker.date.past(),
    expirationDate: Faker.date.recent(),
    backFileUrl: Faker.image.image(),
    frontFileUrl: Faker.image.image()
  }
})