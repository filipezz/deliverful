import request from 'supertest'
import admin from 'firebase-admin'
import Faker from 'faker'
import { mockAuthUser, AuthUserMock } from '../../test/users-helpers'
import { getFirestore, tearDown } from '../../test/firebase-helpers'
import { mockSaveArgyleUserDTO } from './dtos/test/mock-save-argyle-user.dto'
import { usersApp as server } from '.'
import { adminApp } from '../../config/firebase-admin'
import { mockUserDTO } from './test/mock-users.repository'
import { ArgyleService } from '../../services/argyle/argyle.service'
import {
  mockArgyleUserDocumentDTO,
  mockArgyleUserProfileDTO,
  mockUserTokenPayload
} from '../../services/argyle/test/mock-argyle.service'

function mockAuthRequest(_adminApp: admin.app.App): AuthUserMock {
  const authUser = mockAuthUser()
  jest
    .spyOn(_adminApp.auth(), 'verifyIdToken')
    .mockResolvedValueOnce({ uid: authUser.user.uid } as any)
  jest
    .spyOn(_adminApp.auth(), 'getUser')
    .mockResolvedValueOnce({ uid: authUser.user.uid } as any)

  return authUser
}

describe('Users Routes', () => {
  const baseURL = '/users'
  const meURL = baseURL + '/me'
  let agentTest: request.SuperTest<request.Test>

  beforeEach(() => {
    agentTest = request(server)
  })

  afterEach(async () => {
    await tearDown()
  })

  describe('POST /me/argyle', () => {
    const endpointURL = `${meURL}/argyle`
    let requestTest: request.Test

    beforeEach(() => {
      requestTest = agentTest.post(endpointURL)
    })

    it('should return 401, if header Authorization is not set', async () => {
      await requestTest
        .expect(401, {
          title: 'Unauthorized',
          message: 'Token not provided'
        })
    })

    describe('when Authorization token is invalid', () => {
      const invalidToken = Faker.random.alphaNumeric(32)

      beforeEach(() => {
        requestTest.set('Authorization', invalidToken)
      })

      it('should return 401, if header Authorization token is revoked', async () => {
        const error = { code: 'auth/id-token-revoked' }
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockRejectedValueOnce(error)

        await requestTest.expect(401).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Unauthorized',
            message: 'Token revoked',
            error
          })
        })
      })

      it('should return 401, if header Authorization token is expired', async () => {
        const error = { code: 'auth/id-token-expired' }
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockRejectedValueOnce(error)

        await requestTest.expect(401).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Unauthorized',
            message: 'Token expired',
            error
          })
        })
      })

      it('should return 401, if header Authorization token is malformed', async () => {
        const error = { code: 'auth/argument-error' }
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockRejectedValueOnce(error)

        await requestTest.expect(400).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Bad request',
            message: 'Token is invalid or malformed',
            error
          })
        })
      })

      it('should return 401, if user not found', async () => {
        const authUser = mockAuthUser()
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockResolvedValueOnce({ uid: authUser.user.uid } as any)
        const error = { code: 'auth/user-not-found' }
        jest.spyOn(adminApp.auth(), 'getUser').mockRejectedValueOnce(error)

        await requestTest.expect(401).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Unauthorized',
            message: 'User not logged in',
            error
          })
        })
      })
    })

    describe('with Authorization header', () => {
      let authUser: AuthUserMock

      beforeEach(() => {
        authUser = mockAuthRequest(adminApp)
        requestTest.set('Authorization', authUser.token)
      })

      it('should return 200 with correct response data', async () => {
        const requestBody = mockSaveArgyleUserDTO()
        const { user } = authUser
        const expectedResponse = {
          id: user.uid,
          uid: user.uid,
          _namespace: '',
          argyle: requestBody
        }

        await requestTest
          .send(requestBody)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual({
              ...expectedResponse,
              createdAt: expect.any(String),
              updatedAt: expect.any(String)
            })
          })
      })
    })
  })

  describe('POST /me/argyle/accounts', () => {
    const endpointURL = `${meURL}/argyle/accounts`
    let requestTest: request.Test

    beforeEach(() => {
      requestTest = agentTest.post(endpointURL)
    })

    it('should return 401, if header Authorization is not set', async () => {
      await requestTest
        .expect(401, {
          title: 'Unauthorized',
          message: 'Token not provided'
        })
    })

    describe('when Authorization token is invalid', () => {
      const invalidToken = Faker.random.alphaNumeric(32)

      beforeEach(() => {
        requestTest.set('Authorization', invalidToken)
      })

      it('should return 401, if header Authorization token is revoked', async () => {
        const error = { code: 'auth/id-token-revoked' }
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockRejectedValueOnce(error)

        await requestTest.expect(401).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Unauthorized',
            message: 'Token revoked',
            error
          })
        })
      })

      it('should return 401, if header Authorization token is expired', async () => {
        const error = { code: 'auth/id-token-expired' }
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockRejectedValueOnce(error)

        await requestTest.expect(401).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Unauthorized',
            message: 'Token expired',
            error
          })
        })
      })

      it('should return 401, if header Authorization token is malformed', async () => {
        const error = { code: 'auth/argument-error' }
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockRejectedValueOnce(error)

        await requestTest.expect(400).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Bad request',
            message: 'Token is invalid or malformed',
            error
          })
        })
      })

      it('should return 401, if user not found', async () => {
        const authUser = mockAuthUser()
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockResolvedValueOnce({ uid: authUser.user.uid } as any)
        const error = { code: 'auth/user-not-found' }
        jest.spyOn(adminApp.auth(), 'getUser').mockRejectedValueOnce(error)

        await requestTest.expect(401).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Unauthorized',
            message: 'User not logged in',
            error
          })
        })
      })
    })

    describe('with Authorization header', () => {
      let firestore: FirebaseFirestore.Firestore
      let usersRef: FirebaseFirestore.CollectionReference
      let authUser: AuthUserMock

      beforeEach(() => {
        firestore = getFirestore()
        usersRef = firestore.collection('users')

        authUser = mockAuthRequest(adminApp)
        requestTest.set('Authorization', authUser.token)
      })

      it('should return 403, if user argyle data not exists', async () => {
        await requestTest
          .expect(403, {
            title: 'Action forbidden',
            message: 'User argyle not found for current user'
          })
      })

      it('should return 500, if unknown error ocurrs', async () => {
        const { user } = authUser
        jest.spyOn(ArgyleService.getInstance(), 'loadUserProfile')
          .mockRejectedValueOnce({})
        await usersRef.doc(user.uid).set({ argyle: {} })

        await requestTest
          .expect(500)
          .expect(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                title: 'Internal server error',
                message: 'Something unexpected happened. Please, try again.'
              })
            )
          })
      })

      it('should return 204, on success', async () => {
        const { user } = authUser
        jest.spyOn(ArgyleService.getInstance(), 'loadUserProfile')
          .mockResolvedValueOnce(mockArgyleUserProfileDTO())
        jest.spyOn(ArgyleService.getInstance(), 'loadUserDocumentForType')
          .mockResolvedValueOnce(mockArgyleUserDocumentDTO())
        await usersRef.doc(user.uid).set({ argyle: {} })

        await requestTest
          .send({ accountId: Faker.random.uuid() })
          .expect(204)
      })
    })
  })

  describe('GET /me', () => {
    const endpointURL = meURL
    let requestTest: request.Test

    beforeEach(() => {
      requestTest = agentTest.get(endpointURL)
    })

    it('should return 401, if header Authorization is not set', async () => {
      await requestTest
        .expect(401, {
          title: 'Unauthorized',
          message: 'Token not provided'
        })
    })

    describe('when Authorization token is invalid', () => {
      const invalidToken = Faker.random.alphaNumeric(32)

      beforeEach(() => {
        requestTest.set('Authorization', invalidToken)
      })

      it('should return 401, if header Authorization token is revoked', async () => {
        const error = { code: 'auth/id-token-revoked' }
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockRejectedValueOnce(error)

        await requestTest.expect(401).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Unauthorized',
            message: 'Token revoked',
            error
          })
        })
      })

      it('should return 401, if header Authorization token is expired', async () => {
        const error = { code: 'auth/id-token-expired' }
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockRejectedValueOnce(error)

        await requestTest.expect(401).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Unauthorized',
            message: 'Token expired',
            error
          })
        })
      })

      it('should return 401, if header Authorization token is malformed', async () => {
        const error = { code: 'auth/argument-error' }
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockRejectedValueOnce(error)

        await requestTest.expect(400).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Bad request',
            message: 'Token is invalid or malformed',
            error
          })
        })
      })

      it('should return 401, if user not found', async () => {
        const authUser = mockAuthUser()
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockResolvedValueOnce({ uid: authUser.user.uid } as any)
        const error = { code: 'auth/user-not-found' }
        jest.spyOn(adminApp.auth(), 'getUser').mockRejectedValueOnce(error)

        await requestTest.expect(401).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Unauthorized',
            message: 'User not logged in',
            error
          })
        })
      })
    })

    describe('with Authorization header', () => {
      let usersRef: FirebaseFirestore.CollectionReference
      let authUser: AuthUserMock

      beforeEach(() => {
        usersRef = getFirestore().collection('users')

        authUser = mockAuthRequest(adminApp)
        requestTest.set('Authorization', authUser.token)
      })

      it('should return 200 with correct response data', async () => {
        const { user } = authUser
        const userData = mockUserDTO()
        await usersRef.doc(user.uid).set(userData)
        const expectedResponse = {
          id: user.uid,
          uid: user.uid,
          argyle: userData.argyle,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }

        await requestTest.expect(200).expect(({ body }) => {
          expect(body).toEqual(expectedResponse)
        })
      })
    })
  })

  describe('POST /me/argyle/refresh-token', () => {
    const endpointURL = `${meURL}/argyle/refresh-token`
    let requestTest: request.Test

    beforeEach(() => {
      requestTest = agentTest.post(endpointURL)
    })

    it('should return 401, if header Authorization is not set', async () => {
      await requestTest
        .expect(401, {
          title: 'Unauthorized',
          message: 'Token not provided'
        })
    })

    describe('when Authorization token is invalid', () => {
      const invalidToken = Faker.random.alphaNumeric(32)

      beforeEach(() => {
        requestTest.set('Authorization', invalidToken)
      })

      it('should return 401, if header Authorization token is revoked', async () => {
        const error = { code: 'auth/id-token-revoked' }
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockRejectedValueOnce(error)

        await requestTest.expect(401).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Unauthorized',
            message: 'Token revoked',
            error
          })
        })
      })

      it('should return 401, if header Authorization token is expired', async () => {
        const error = { code: 'auth/id-token-expired' }
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockRejectedValueOnce(error)

        await requestTest.expect(401).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Unauthorized',
            message: 'Token expired',
            error
          })
        })
      })

      it('should return 401, if header Authorization token is malformed', async () => {
        const error = { code: 'auth/argument-error' }
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockRejectedValueOnce(error)

        await requestTest.expect(400).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Bad request',
            message: 'Token is invalid or malformed',
            error
          })
        })
      })

      it('should return 401, if user not found', async () => {
        const authUser = mockAuthUser()
        jest
          .spyOn(adminApp.auth(), 'verifyIdToken')
          .mockResolvedValueOnce({ uid: authUser.user.uid } as any)
        const error = { code: 'auth/user-not-found' }
        jest.spyOn(adminApp.auth(), 'getUser').mockRejectedValueOnce(error)

        await requestTest.expect(401).expect(({ body }) => {
          expect(body).toEqual({
            title: 'Unauthorized',
            message: 'User not logged in',
            error
          })
        })
      })
    })

    describe('with Authorization header', () => {
      let usersRef: FirebaseFirestore.CollectionReference
      let authUser: AuthUserMock

      beforeEach(() => {
        usersRef = getFirestore().collection('users')

        authUser = mockAuthRequest(adminApp)
        requestTest.set('Authorization', authUser.token)
      })

      it('should return 403, if user argyle data not exists', async () => {
        await requestTest
          .expect(403, {
            title: 'Action forbidden',
            message: 'User argyle not found for current user'
          })
      })

      it('should return 500, if unknown error ocurrs', async () => {
        const { user } = authUser
        jest.spyOn(ArgyleService.getInstance(), 'createUserToken')
          .mockRejectedValueOnce({})
        await usersRef.doc(user.uid).set({ argyle: {} })

        await requestTest
          .expect(500)
          .expect(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                title: 'Internal server error',
                message: 'Something unexpected happened. Please, try again.'
              })
            )
          })
      })

      it('should return 200 with correct response data', async () => {
        const { user } = authUser
        const argyleUserTokenPayload = mockUserTokenPayload()
        jest.spyOn(ArgyleService.getInstance(), 'createUserToken')
          .mockResolvedValueOnce(argyleUserTokenPayload)
        const argyleData = { userId: Faker.random.uuid() }
        await usersRef.doc(user.uid).set({ argyle: argyleData })

        await requestTest
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: user.uid,
              uid: user.uid,
              _namespace: '',
              argyle: {
                userId: argyleData.userId,
                userToken: argyleUserTokenPayload.access
              },
              createdAt: expect.any(String),
              updatedAt: expect.any(String)
            })
          })
      })
    })
  })
})