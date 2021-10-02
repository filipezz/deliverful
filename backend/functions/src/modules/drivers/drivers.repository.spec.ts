import Faker from 'faker'
import { getFirestore, tearDown } from '../../test/firebase-helpers'
import { DriversRepository } from './drivers.repository'
import { SaveUserDriverDTO, UserDriverDTO } from 'deliverful-types/drivers/dtos'
import { mockSaveUserDriverDTO } from './dtos/test/mock-save-user-driver.dto'
import { mockUserDriverDTO } from './test/mock-drivers.repository'

type ISutTypes = {
  repository: DriversRepository
  driversRef: FirebaseFirestore.CollectionReference
};

function makeSut(): ISutTypes {
  const firestore = getFirestore()
  const driversRef = firestore.collection('drivers')
  const repository = new DriversRepository(firestore)

  return {
    repository,
    driversRef
  }
}

describe('Drivers Repository', () => {
  let sut: ISutTypes

  beforeEach(() => {
    sut = makeSut()
  })

  afterEach(async () => {
    await tearDown()
  })

  describe('saveDriver()', () => {
    let uid: string
    let dto: SaveUserDriverDTO

    beforeEach(() => {
      uid = Faker.random.alphaNumeric(18)
      dto = mockSaveUserDriverDTO()
    })

    describe('getDriver()', () => {
      it('should call getDriver() with correct params', async () => {
        const getDriverSpy = jest.spyOn(sut.repository, 'getDriver')

        await sut.repository.saveDriver(uid, dto)

        expect(getDriverSpy).toHaveBeenCalledTimes(2)
        expect(getDriverSpy).toHaveBeenCalledWith(uid)
      })
    })

    it('should create a UserDriver within "drivers" collection, with correct data', async () => {
      const result = await sut.repository.saveDriver(uid, dto)

      const actualUserDriverData = (await sut.driversRef.doc(uid).get()).data()
      expect(result).toEqual({
        id: uid,
        uid,
        ...actualUserDriverData,
        license: {
          ...actualUserDriverData?.license,
          issuedDate: expect.any(Date),
          expirationDate: expect.any(Date)
        },
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('should not create "license" field in UserDriver, if not intended', async () => {
      const oldUserDriverData = { uid: Faker.random.uuid() } as UserDriverDTO
      await sut.driversRef.doc(uid).set(oldUserDriverData)
      delete dto.license

      await sut.repository.saveDriver(uid, dto)

      const actualUserDriverData = (await sut.driversRef.doc(uid).get()).data()
      expect(actualUserDriverData?.address).toBeFalsy()
      expect(actualUserDriverData).toEqual(
        expect.objectContaining({
          ...oldUserDriverData,
          ...dto
        })
      )
    })

    it('should return updated UserDriver', async () => {
      const oldUserDriverData = mockUserDriverDTO()
      await sut.driversRef.doc(uid).set(oldUserDriverData)
      dto = {
        license: {
          backFileUrl: Faker.random.image(),
          frontFileUrl: Faker.random.image()
        }
      }

      const result = await sut.repository.saveDriver(uid, dto)

      expect(result).toEqual({
        ...oldUserDriverData,
        ...dto,
        license: {
          ...oldUserDriverData.license,
          ...dto.license
        },
        _namespace: '',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        id: uid,
        uid
      })
    })

    describe('save driver with "license"', () => {
      it('should not override old UserDriver, if not intended', async () => {
        const oldUserDriverData: Partial<UserDriverDTO> = {
          license: {
            number: Faker.random.alphaNumeric(11),
            backFileUrl: Faker.random.image(),
            frontFileUrl: Faker.random.image(),
            issuedDate: Faker.date.past(),
            expirationDate: Faker.date.recent()
          }
        }
        await sut.driversRef.doc(uid).set(oldUserDriverData)
        dto = {
          license: {
            backFileUrl: Faker.random.image(),
            frontFileUrl: Faker.random.image(),
            expirationDate: Faker.date.future()
          }
        }

        await sut.repository.saveDriver(uid, dto)

        const actualUserDriverData = (await sut.driversRef.doc(uid).get()).data()
        expect(actualUserDriverData).toEqual(
          expect.objectContaining({
            ...oldUserDriverData,
            ...dto,
            license: {
              ...oldUserDriverData.license,
              ...dto.license,
              issuedDate: expect.any(Object),
              expirationDate: expect.any(Object)
            }
          })
        )
      })
    })
  })

  describe('getDriver()', () => {
    let uid: string

    beforeEach(() => {
      uid = Faker.random.alphaNumeric(18)
    })

    it('should return null if UserDriver with "uid" not found', async () => {
      const otherUid = Faker.random.alphaNumeric(18)
      await sut.driversRef.doc(otherUid).set({})

      const result = await sut.repository.getDriver(uid)

      expect(result).toBeNull()
    })

    it('should return UserDriver with correct "uid"', async () => {
      const userDriverData = { ...mockUserDriverDTO(), uid }
      const otherUserDriverData = mockUserDriverDTO()
      await Promise.all([
        sut.driversRef.doc(otherUserDriverData.uid).set(mockUserDriverDTO()),
        sut.driversRef.doc(uid).set(userDriverData)
      ])

      const result = await sut.repository.getDriver(uid)

      expect(result).toEqual({
        ...userDriverData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        id: uid,
        uid
      })
    })
  })
})