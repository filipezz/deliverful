import Faker from 'faker'
import { SaveArgyleUserDTO } from 'deliverful-types/users/dtos/save-argyle-user.dto'

export const mockSaveArgyleUserDTO = (): SaveArgyleUserDTO => ({
  userId: Faker.random.uuid(),
  userToken: Faker.random.alphaNumeric(32)
})