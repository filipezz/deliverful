import Faker from 'faker'
import { SaveUserProfileDTO } from 'deliverful-types/profiles/dtos/save-user-profile.dto'

export const mockSaveUserProfileDTO = (): SaveUserProfileDTO => ({
  name: Faker.name.findName(),
  email: Faker.internet.email(),
  phone: Faker.phone.phoneNumber(),
  picture: Faker.image.avatar(),
  address: {
    line1: Faker.address.streetAddress(false),
    line2: Faker.address.secondaryAddress(),
    city: Faker.address.city(),
    state: Faker.address.stateAbbr(),
    postalCode: Faker.address.zipCode(),
    country: Faker.address.countryCode()
  }
})