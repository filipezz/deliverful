import Faker from 'faker'
import {
  ArgyleUserDocumentDTO,
  ArgyleUserDocumentType,
  ArgyleUserProfileDTO,
  GigExperienceDTO,
  UserTokenPayload
} from 'deliverful-types/argyle/dtos'
import { IArgyleService, LoadUserItemDTO } from '../protocols/i-argyle.service'
import { argyleUserDocumentTypes } from '../constants/argyle-user-document-types'

export class ArgyleServiceSpy implements IArgyleService {
  userTokenPayload = mockUserTokenPayload()
  userProfileDTO = mockArgyleUserProfileDTO()
  gigExperiences = mockGigExperienceDTOs()
  userDocumentDTO = mockArgyleUserDocumentDTO()

  async createUserToken(userId: string): Promise<UserTokenPayload> {
    return this.userTokenPayload
  }
  async loadUserProfile(userId: string, accountId: string): Promise<ArgyleUserProfileDTO | null> {
    return this.userProfileDTO
  }
  async loadUserDocumentForType(dto: LoadUserItemDTO, type: ArgyleUserDocumentType): Promise<ArgyleUserDocumentDTO | null> {
    return this.userDocumentDTO
  }
  async listGigExperiences(userId: string): Promise<GigExperienceDTO[]> {
    return this.gigExperiences
  }
}

export const mockUserTokenPayload = (): UserTokenPayload => ({
  access: Faker.random.alphaNumeric(36)
})

export const mockArgyleUserProfileDTO = (): ArgyleUserProfileDTO => ({
  id: Faker.random.uuid(),
  account: Faker.random.uuid(),
  fullName: Faker.name.findName(),
  firstName: Faker.name.firstName(),
  lastName: Faker.name.lastName(),
  ssn: Faker.random.alphaNumeric(9),
  email: Faker.internet.email(),
  birthdate: Faker.date.past(),
  address: {
    line1: Faker.address.streetAddress(false),
    line2: Faker.address.secondaryAddress(),
    city: Faker.address.city(),
    state: Faker.address.stateAbbr(),
    postalCode: Faker.address.zipCode(),
    country: Faker.address.countryCode()
  },
  employer: Faker.company.companyName(),
  gender: Faker.random.arrayElement(['male', 'female']),
  phoneNumber: Faker.phone.phoneNumber(),
  pictureUrl: Faker.image.avatar()
})

export const mockArgyleUserDocumentDTO = (): ArgyleUserDocumentDTO => ({
  id: Faker.random.uuid(),
  account: Faker.random.uuid(),
  employer: Faker.company.companyName(),
  number: Faker.random.alphaNumeric(11),
  type: Faker.random.objectElement<ArgyleUserDocumentType>(argyleUserDocumentTypes),
  expirationDate: Faker.date.recent(),
  issuedDate: Faker.date.past(),
  typeDescription: Faker.random.words(),
  fileUrl: Faker.image.image()
})

export const mockGigExperienceDTOs = (): GigExperienceDTO[] => ([
  mockGigExperienceDTO(), mockGigExperienceDTO()
])

const mockGigExperienceDTO = (): GigExperienceDTO => ({
  id: Faker.random.uuid(),
  employer: Faker.company.companyName(),
  hireDatetime: Faker.date.past(),
  terminationDatetime: Faker.date.recent(),
  rating: Faker.random.float({ min: 1, max: 5, precision: 2 }).toString(),
  trips: Faker.random.number({ min: 1 }),
  awards: [
    {
      label: Faker.hacker.noun(),
      description: Faker.hacker.phrase(),
      badgeUrl: Faker.internet.avatar()
    }
  ]
})