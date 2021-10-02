import Faker from 'faker'
import { getFirestore, tearDown } from '../../test/firebase-helpers'
import {
  SaveUserProfileDTO,
  UserProfileDTO,
  SaveWorkPreferencesDTO
} from 'deliverful-types/profiles/dtos'
import { mockSaveUserProfileDTO } from './dtos/test/mock-save-user-profile.dto'
import { ProfilesRepository } from './profiles.repository'
import { mockUserProfileDTO, mockUserWorkPreferencesDTO } from './test/mock-profiles.repository'
import { mockSaveWorkPreferencesDTO } from './dtos/test/mock-save-work-preferences.dto'

type ISutTypes = {
  repository: ProfilesRepository
  profilesRef: FirebaseFirestore.CollectionReference
  workPreferencesRef: FirebaseFirestore.CollectionReference
};

async function makeSut(): Promise<ISutTypes> {
  const firestore = getFirestore()
  const profilesRef = firestore.collection('profiles')
  const workPreferencesRef = firestore.collection('workPreferences')
  const repository = new ProfilesRepository(firestore)

  return {
    repository,
    profilesRef,
    workPreferencesRef
  }
}

describe('Profiles Repository', () => {
  let repository: ProfilesRepository
  let profilesRef: FirebaseFirestore.CollectionReference
  let workPreferencesRef: FirebaseFirestore.CollectionReference

  beforeEach(async () => {
    const sut = await makeSut()
    repository = sut.repository
    profilesRef = sut.profilesRef
    workPreferencesRef = sut.workPreferencesRef
  })

  afterEach(async () => {
    await tearDown()
  })

  describe('saveProfile()', () => {
    let uid: string
    let dto: SaveUserProfileDTO

    beforeEach(() => {
      uid = Faker.random.alphaNumeric(18)
      dto = mockSaveUserProfileDTO()
    })

    describe('getProfile()', () => {
      it('should call getProfile() with correct params', async () => {
        const getProfileSpy = jest.spyOn(repository, 'getProfile')

        await repository.saveProfile(uid, dto)

        expect(getProfileSpy).toHaveBeenCalledTimes(2)
        expect(getProfileSpy).toHaveBeenCalledWith(uid)
      })
    })

    it('should create a UserProfile within "profiles" collection, with correct data', async () => {
      const result = await repository.saveProfile(uid, dto)

      const actualUserProfileData = (await profilesRef.doc(uid).get()).data()
      expect(result).toEqual({
        uid,
        ...actualUserProfileData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('should not override old UserProfile, if not intended', async () => {
      const oldUserProfileData = {
        name: Faker.name.findName(),
        email: Faker.internet.email()
      } as UserProfileDTO
      await profilesRef.doc(uid).set(oldUserProfileData)
      dto = { phone: Faker.phone.phoneNumber() }

      await repository.saveProfile(uid, dto)

      const actualUserProfileData = (await profilesRef.doc(uid).get()).data()
      expect(actualUserProfileData).toEqual(
        expect.objectContaining({
          ...oldUserProfileData,
          ...dto
        })
      )
    })

    it('should not create "address" field in UserProfile, if not intended', async () => {
      const oldUserProfileData = {
        name: Faker.name.findName(),
        email: Faker.internet.email()
      } as UserProfileDTO
      await profilesRef.doc(uid).set(oldUserProfileData)
      delete dto.address

      await repository.saveProfile(uid, dto)

      const actualUserProfileData = (await profilesRef.doc(uid).get()).data()
      expect(actualUserProfileData?.address).toBeFalsy()
      expect(actualUserProfileData).toEqual(
        expect.objectContaining({
          ...oldUserProfileData,
          ...dto
        })
      )
    })

    it('should return updated UserProfile', async () => {
      const oldUserProfileData = mockUserProfileDTO()
      await profilesRef.doc(uid).set(oldUserProfileData)
      dto = {
        email: Faker.internet.email(),
        phone: Faker.phone.phoneNumber()
      }

      const result = await repository.saveProfile(uid, dto)

      expect(result).toEqual({
        ...oldUserProfileData,
        ...dto,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        _namespace: '',
        id: uid,
        uid
      })
    })

    describe('saving profile with "picture"', () => {
      it('should append a "picture" into "picturesGallery"', async () => {
        const result = await repository.saveProfile(uid, dto)

        const actualUserProfileData = (await profilesRef.doc(uid).get()).data()
        expect(result).toEqual({
          ...actualUserProfileData,
          uid,
          picture: dto.picture,
          picturesGallery: [dto.picture],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      })

      it('should append a "picture" into "picturesGallery" without erasing "picturesGallery"', async () => {
        const oldUserProfileData = mockUserProfileDTO()
        await profilesRef.doc(uid).set(oldUserProfileData)
        dto = { picture: Faker.image.avatar() }

        const result = await repository.saveProfile(uid, dto)

        const actualUserProfileData = (await profilesRef.doc(uid).get()).data()
        expect(result.picturesGallery).toHaveLength(2)
        expect(result).toEqual({
          ...actualUserProfileData,
          uid,
          picture: dto.picture,
          picturesGallery: expect.arrayContaining([
            ...result.picturesGallery as string[],
            dto.picture
          ]),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      })

      it('should not append "picture" to "picturesGallery", if already exists', async () => {
        const oldUserProfileData = mockUserProfileDTO()
        await profilesRef.doc(uid).set(oldUserProfileData)
        dto = { picture: oldUserProfileData.picture }

        const result = await repository.saveProfile(uid, dto)

        const actualUserProfileData = (await profilesRef.doc(uid).get()).data()
        expect(result.picturesGallery).toHaveLength(1)
        expect(result).toEqual({
          ...actualUserProfileData,
          uid,
          picture: oldUserProfileData.picture,
          picturesGallery: [oldUserProfileData.picture],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      })

      it('should not update "picture", if "replacePicture" is explicity set to false', async () => {
        const oldUserProfileData = mockUserProfileDTO()
        await profilesRef.doc(uid).set(oldUserProfileData)
        const newProfilePicture = Faker.image.avatar()
        dto = { picture: newProfilePicture }

        const result = await repository.saveProfile(uid, dto, false)

        const actualUserProfileData = (await profilesRef.doc(uid).get()).data()
        expect(result).toEqual({
          ...actualUserProfileData,
          uid,
          picture: oldUserProfileData.picture,
          picturesGallery: [oldUserProfileData.picture, newProfilePicture],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      })

      it('should set "picture" if not exists, even if "replacePicture" is explicity set to false', async () => {
        const oldUserProfileData = {
          ...mockUserProfileDTO(),
          picture: null,
          picturesGallery: []
        }
        await profilesRef.doc(uid).set(oldUserProfileData)
        const newProfilePicture = Faker.image.avatar()
        dto = { picture: newProfilePicture }

        const result = await repository.saveProfile(uid, dto, false)

        const actualUserProfileData = (await profilesRef.doc(uid).get()).data()
        expect(result).toEqual({
          ...actualUserProfileData,
          uid,
          picture: newProfilePicture,
          picturesGallery: [newProfilePicture],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      })
    })

    describe('save profile with "address"', () => {
      it('should not override old UserProfile, if not intended', async () => {
        const oldUserProfileData = {
          name: Faker.name.findName(),
          email: Faker.internet.email(),
          address: {
            line1: Faker.address.streetAddress(false),
            city: Faker.address.city()
          }
        } as UserProfileDTO
        await profilesRef.doc(uid).set(oldUserProfileData)
        dto = {
          address: {
            line2: Faker.address.secondaryAddress(),
            postalCode: Faker.address.zipCode(),
            state: Faker.address.state()
          }
        }

        await repository.saveProfile(uid, dto)

        const actualUserProfileData = (await profilesRef.doc(uid).get()).data()
        expect(actualUserProfileData).toEqual(
          expect.objectContaining({
            ...oldUserProfileData,
            ...dto,
            address: {
              ...oldUserProfileData.address,
              ...dto.address
            }
          })
        )
      })
    })
  })

  describe('getProfile()', () => {
    let uid: string

    beforeEach(() => {
      uid = Faker.random.alphaNumeric(18)
    })

    it('should return null if UserProfile with "uid" not found', async () => {
      const otherUid = Faker.random.alphaNumeric(18)
      await profilesRef.doc(otherUid).set({})

      const result = await repository.getProfile(uid)

      expect(result).toBeNull()
    })

    it('should return UserProfile with correct data', async () => {
      const userProfileData = { ...mockUserProfileDTO(), uid }
      const otherUserProfileData = mockUserProfileDTO()
      await Promise.all([
        profilesRef.doc(otherUserProfileData.uid).set(mockUserProfileDTO()),
        profilesRef.doc(uid).set(userProfileData)
      ])

      const result = await repository.getProfile(uid)

      expect(result).toEqual({
        ...userProfileData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        id: uid,
        uid
      })
    })
  })

  describe('saveWorkPreferences()', () => {
    let uid: string
    let dto: SaveWorkPreferencesDTO

    beforeEach(() => {
      uid = Faker.random.alphaNumeric(18)
      dto = mockSaveWorkPreferencesDTO()
    })

    describe('getWorkPreferences()', () => {
      it('should call getWorkPreferences() with correct params', async () => {
        const getWorkPreferencesSpy = jest.spyOn(repository, 'getWorkPreferences')

        await repository.saveWorkPreferences(uid, dto)

        expect(getWorkPreferencesSpy).toHaveBeenCalledTimes(2)
        expect(getWorkPreferencesSpy).toHaveBeenCalledWith(uid)
      })
    })

    it('should create WorkPreferences within "workPreferences" collection, with correct data', async () => {
      const result = await repository.saveWorkPreferences(uid, dto)
      const actualWorkPreferencesData = (await workPreferencesRef.doc(uid).get()).data()

      expect(result).toEqual({
        ...actualWorkPreferencesData,
        willingToStartAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        uid
      })
    })

    it('should not override old WorkPreferences, if not intended', async () => {
      const oldWorkPreferencesData = mockUserWorkPreferencesDTO()
      await workPreferencesRef.doc(uid).set(oldWorkPreferencesData)
      dto = { availability: mockUserWorkPreferencesDTO().availability }

      await repository.saveWorkPreferences(uid, dto)

      const actualWorkPreferencesData = (await workPreferencesRef.doc(uid).get()).data()
      expect(actualWorkPreferencesData).toEqual(
        expect.objectContaining({
          ...oldWorkPreferencesData,
          ...dto,
          willingToStartAt: expect.any(Object),
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object)
        })
      )
    })

    it('should return updated WorkPreferences', async () => {
      const oldWorkPreferencesData = mockUserWorkPreferencesDTO()
      await workPreferencesRef.doc(uid).set(oldWorkPreferencesData)
      dto = {
        workingRadius: mockUserWorkPreferencesDTO().workingRadius
      }

      const result = await repository.saveWorkPreferences(uid, dto)

      expect(result).toEqual({
        ...oldWorkPreferencesData,
        ...dto,
        willingToStartAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        _namespace: '',
        id: uid,
        uid
      })
    })
  })

  describe('getWorkPreferences()', () => {
    let uid: string

    beforeEach(() => {
      uid = Faker.random.alphaNumeric(18)
    })

    it('should return null if WorkPreferences with "uid" not found', async () => {
      const otherUid = Faker.random.alphaNumeric(18)
      await workPreferencesRef.doc(otherUid).set({})

      const result = await repository.getWorkPreferences(uid)

      expect(result).toBeNull()
    })

    it('should return WorkPreferences with correct "uid"', async () => {
      const workPreferencesData = { ...mockUserWorkPreferencesDTO(), uid }
      const otherWorkPreferencesData = mockUserWorkPreferencesDTO()
      await Promise.all([
        workPreferencesRef.doc(otherWorkPreferencesData.uid).set(otherWorkPreferencesData),
        workPreferencesRef.doc(uid).set(workPreferencesData)
      ])

      const result = await repository.getWorkPreferences(uid)

      expect(result).toEqual({
        ...workPreferencesData,
        willingToStartAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        id: uid,
        uid
      })
    })
  })
})