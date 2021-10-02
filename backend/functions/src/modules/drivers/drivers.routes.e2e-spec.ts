import request from 'supertest'
import Faker from 'faker'
import admin from 'firebase-admin'
import { tearDown } from '../../test/firebase-helpers'
import { mockAuthUser, AuthUserMock } from '../../test/users-helpers'
import { driversApp as server } from '.'
import { adminApp } from '../../config/firebase-admin'
import { mockSaveUserDriverDTO } from './dtos/test/mock-save-user-driver.dto'
import { UserDriverDTO } from 'deliverful-types/drivers/dtos'

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

describe('Drivers Routes', () => {
  const baseURL = '/drivers'
  const meURL = baseURL + '/me'
  let agentTest: request.SuperTest<request.Test>

  beforeEach(() => {
    agentTest = request(server)
  })

  afterEach(async () => {
    await tearDown()
  })

  describe('POST /me', () => {
    const endpointURL = meURL
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

      it('should return 200, with correct response data', async () => {
        const requestBody = mockSaveUserDriverDTO()
        const { user } = authUser
        const expectedResponse = {
          _namespace: '',
          id: user.uid,
          uid: user.uid,
          license: {
            ...requestBody.license,
            issuedDate: expect.any(String),
            expirationDate: expect.any(String)
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        } as UserDriverDTO

        await requestTest
          .send(requestBody)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual(expectedResponse)
          })
      })
    })
  })
})