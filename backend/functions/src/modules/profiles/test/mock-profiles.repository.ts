import Faker from 'faker'
import {
  SaveUserProfileDTO,
  UserProfileDTO,
  UserWorkPreferencesDTO,
  SaveWorkPreferencesDTO
} from 'deliverful-types/profiles/dtos'
import { IProfilesRepository } from '../protocols/i-profiles.repository'
import { sortWorkAvailabilityTimes } from '../dtos/test/mock-save-work-preferences.dto'
import { jobPositionType } from '../constants/job-position-types'

export class ProfilesRepositorySpy implements IProfilesRepository {
  userProfileDTO = mockUserProfileDTO()
  userWorkPreferencesDTO = mockUserWorkPreferencesDTO()

  async saveProfile(uid: string, dto: SaveUserProfileDTO, replacePicture?: boolean): Promise<UserProfileDTO> {
    return this.userProfileDTO
  }

  async getProfile(uid: string): Promise<UserProfileDTO | null> {
    return this.userProfileDTO
  }

  async saveWorkPreferences(uid: string, dto: SaveWorkPreferencesDTO): Promise<UserWorkPreferencesDTO> {
    return this.userWorkPreferencesDTO
  }

  async getWorkPreferences(uid: string): Promise<UserWorkPreferencesDTO | null> {
    return this.userWorkPreferencesDTO
  }

  async saveQuestionnaire(uid: string): Promise<UserProfileDTO | null> {
    return this.userProfileDTO
  }

}

export const mockUserProfileDTO = (): UserProfileDTO => {
  const profilePicture = Faker.image.avatar()
  return {
    uid: Faker.random.alphaNumeric(18),
    name: Faker.name.findName(),
    email: Faker.internet.email(),
    phone: Faker.phone.phoneNumber(),
    picture: profilePicture,
    address: {
      line1: Faker.address.streetAddress(false),
      line2: Faker.address.secondaryAddress(),
      city: Faker.address.city(),
      state: Faker.address.stateAbbr(),
      postalCode: Faker.address.zipCode(),
      country: Faker.address.countryCode()
    },
    picturesGallery: [profilePicture],
    createdAt: Faker.date.past(),
    updatedAt: Faker.date.recent()
  }
}

export const mockUserWorkPreferencesDTO = (): UserWorkPreferencesDTO => {
  const jobPositionTypes = Object
    .values(jobPositionType)
    .sort(() => Math.random() > .5 ? 1 : -1)
  return {
    uid: Faker.random.alphaNumeric(18),
    availability: [
      sortWorkAvailabilityTimes({
        startsAt: Faker.date.recent().toLocaleTimeString(),
        endsAt: Faker.date.recent().toLocaleTimeString()
      }),
      ...Array.from({ length: 6 }).map(() => {
        const isAvailable = Math.random() > .5
        if (isAvailable) {
          return sortWorkAvailabilityTimes({
            startsAt: Faker.date.recent().toLocaleTimeString(),
            endsAt: Faker.date.recent().toLocaleTimeString()
          })
        } else {
          return null
        }
      })
    ],
    jobPositionTypes: [jobPositionTypes[0], jobPositionTypes[1]],
    willingToStartAt: Faker.date.recent(),
    workingRadius: (() => {
      const minMiles = Faker.random.number()
      const maxMiles = Faker.random.number({ min: minMiles })
      return [minMiles, maxMiles]
    })(),
    createdAt: Faker.date.past(),
    updatedAt: Faker.date.recent()
  }
}