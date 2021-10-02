import Faker from 'faker'
import { SaveUserProfileDTO } from 'deliverful-types/profiles/dtos/save-user-profile.dto'

export const mockSaveUserProfileDTO = (): SaveUserProfileDTO => ({
  name: Faker.name.findName(),
  email: Faker.internet.email(),
  phone: Faker.phone.phoneNumber(),
  picture: Faker.image.avatar()
})