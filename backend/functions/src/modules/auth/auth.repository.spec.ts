import Faker from 'faker'
import firebase from 'firebase'
import { AuthRepository } from './auth.repository'
import { RegisterPayloadDTO, LoginPayloadDTO } from 'deliverful-types/auth/dtos'
import { tearDown } from '../../test/firebase-helpers'
import { getFirApp } from '../../config/firebase'
import { mockRegisterPayloadDTO } from './dtos/test/mock-register-payload.dto'
import {
  HttpJsonErrorResponse} from '../../helpers/http.helpers'
import { adminApp } from '../../config/firebase-admin'

type ISutTypes = {
  repository: AuthRepository;
  firApp: firebase.app.App
};

async function makeSut(): Promise<ISutTypes> {
  const firApp = getFirApp()
  const repository = new AuthRepository(firApp, adminApp)

  return {
    repository,
    firApp
  }
}

describe('Auth Repository', () => {
  let sut: ISutTypes

  beforeEach(async () => {
    sut = await makeSut()
  })

  afterEach(async () => {
    await tearDown()
  })

  describe('signInWithEmailAndPassword()', () => {
    let loginPayloadDTO: LoginPayloadDTO

    beforeEach(() => {
      loginPayloadDTO = {
        email: Faker.internet.email(),
        password: Faker.internet.password()
      }
    })

    describe('FirebaseApp dependency', () => {
      it('should call auth().signInWithEmailAndPassword() with correct params', async () => {
        const signInWithEmailAndPasswordSpy = jest
          .spyOn(sut.firApp.auth(), 'signInWithEmailAndPassword')
          .mockResolvedValueOnce({
            user: { uid: Faker.random.alphaNumeric(18) }
          } as firebase.auth.UserCredential)

        await sut.repository.signInWithEmailAndPassword(loginPayloadDTO)

        expect(signInWithEmailAndPasswordSpy).toHaveBeenCalledTimes(1)
        expect(signInWithEmailAndPasswordSpy).toHaveBeenCalledWith(
          loginPayloadDTO.email,
          loginPayloadDTO.password
        )
      })

      it('should throw HttpJsonErrorResponse, auth().signInWithEmailAndPassword() returns no user', async () => {
        jest
          .spyOn(sut.firApp.auth(), 'signInWithEmailAndPassword')
          .mockResolvedValueOnce({} as firebase.auth.UserCredential)

        const promise = sut.repository.signInWithEmailAndPassword(loginPayloadDTO)

        expect(promise).rejects.toEqual(
          new HttpJsonErrorResponse('Bad request', 'No user provided')
        )
      })
    })

    //it('should return correct response, on success', async () => {
    //  const mockedUserCredential = {
     //   user: { uid: Faker.random.alphaNumeric(18) },
      //} as firebase.auth.UserCredential
      //const mockedUserProfile = mockAuthPayloadDTO()
      //jest
      //  .spyOn(sut.firApp.auth(), 'signInWithEmailAndPassword')
        //.mockResolvedValueOnce(mockedUserCredential)
      //const result = await sut.repository.signInWithEmailAndPassword(
       // loginPayloadDTO
     // )

      //expect(result).toEqual({
       // ...mockedUserCredential,
        //profile: mockedUserProfile,
      //})
    //})
  })

  describe('register()', () => {
    let dto: RegisterPayloadDTO
    let mockedUserCredential: any

    beforeEach(() => {
      dto = mockRegisterPayloadDTO()
      mockedUserCredential = {
        user: {
          toJSON() {
            return mockedUserCredential.userData
          }
        },
        userData: {
          uid: Faker.random.alphaNumeric(18),
          stsTokenManager: {
            accessToken: Faker.random.alphaNumeric(64),
            refreshToken: Faker.random.alphaNumeric(64),
            expirationTime: Faker.random.number()
          }
        }
      }
    })

    describe('FirebaseApp dependency', () => {
      it('should call auth().createUserWithEmailAndPassword() with correct params', async () => {
        const createUserWithEmailAndPasswordSpy = jest
          .spyOn(sut.firApp.auth(), 'createUserWithEmailAndPassword')
          .mockResolvedValueOnce(mockedUserCredential)

        await sut.repository.register(dto)

        expect(createUserWithEmailAndPasswordSpy).toHaveBeenCalledTimes(1)
        expect(createUserWithEmailAndPasswordSpy).toHaveBeenCalledWith(
          dto.email,
          dto.password
        )
      })
    })

    describe('after User has succesfully being created', () => {
      it('should return correct response, on success', async () => {
        jest
          .spyOn(sut.firApp.auth(), 'createUserWithEmailAndPassword')
          .mockResolvedValueOnce(mockedUserCredential)
        const result = await sut.repository.register(dto)

        expect(result).toEqual({
          uid: mockedUserCredential.userData.uid,
          token: mockedUserCredential.userData.stsTokenManager
        })
      })
    })
  })
})