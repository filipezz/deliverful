import { SaveArgyleUserDTO } from 'deliverful-types/users/dtos'
import Faker from 'faker'
import { getFirestore, tearDown } from '../../test/firebase-helpers'
import { mockSaveArgyleUserDTO } from './dtos/test/mock-save-argyle-user.dto'
import { UsersRepository } from './users.repository'

type ISutTypes = {
  repository: UsersRepository
  usersRef: FirebaseFirestore.CollectionReference
};

async function makeSut(): Promise<ISutTypes> {
  const firestore = getFirestore()
  const usersRef = firestore.collection('users')
  const repository = new UsersRepository(firestore)

  return {
    repository,
    usersRef
  }
}

describe('Users Repository', () => {
  let repository: UsersRepository
  let usersRef: FirebaseFirestore.CollectionReference

  beforeEach(async () => {
    const sut = await makeSut()
    repository = sut.repository
    usersRef = sut.usersRef
  })

  afterEach(async () => {
    await tearDown()
  })

  describe('saveArgyleUser()', () => {
    let uid: string
    let dto: SaveArgyleUserDTO

    beforeEach(() => {
      uid = Faker.random.alphaNumeric(18)
      dto = mockSaveArgyleUserDTO()
    })

    describe('getUser()', () => {
      it('should call getUser() with correct params', async () => {
        const getUserSpy = jest.spyOn(repository, 'getUser')

        await repository.saveArgyleUser(uid, dto)

        expect(getUserSpy).toHaveBeenCalledTimes(2)
        expect(getUserSpy).toHaveBeenCalledWith(uid)
      })
    })

    it('should create a user within "users" collection, with correct argyle property', async () => {
      const result = await repository.saveArgyleUser(uid, dto)

      const actualUserData = (await usersRef.doc(uid).get()).data()
      expect(result).toEqual({
        id: uid,
        uid,
        ...actualUserData,
        createdAt: expect.any(Object),
        updatedAt: expect.any(Object)
      })
    })

    it('should not override old user data within "users" collection', async () => {
      const oldUserData = {
        firstName: Faker.name.firstName(),
        lastName: Faker.name.lastName()
      }
      await usersRef.doc(uid).set(oldUserData)

      await repository.saveArgyleUser(uid, dto)

      const actualUserData = (await usersRef.doc(uid).get()).data()
      expect(actualUserData).toEqual({
        id: uid,
        _namespace: '',
        ...oldUserData,
        argyle: dto,
        createdAt: expect.any(Object),
        updatedAt: expect.any(Object)
      })
    })
  })

  describe('getUser()', () => {
    let uid: string

    beforeEach(() => {
      uid = Faker.random.alphaNumeric(18)
    })

    it('should return User with correct "id"', async () => {
      const otherUid = Faker.random.alphaNumeric(18)
      await Promise.all([
        usersRef.doc(otherUid).set({}),
        usersRef.doc(uid).set({})
      ])

      const result = await repository.getUser(uid)

      expect(result).toEqual(expect.objectContaining({ id: uid }))
    })

    it('should return User with argyle property, if exists', async () => {
      const userArgyleData = mockSaveArgyleUserDTO()
      await usersRef.doc(uid).set({
        argyle: userArgyleData
      })

      const result = await repository.getUser(uid)

      expect(result).toEqual({
        id: uid,
        uid,
        argyle: userArgyleData
      })
    })

    it('should return User with nullable argyle property, if not exists', async () => {
      await usersRef.doc(uid).set({})

      const result = await repository.getUser(uid)

      expect(result).toEqual({
        id: uid,
        uid,
        argyle: null
      })
    })
  })
})