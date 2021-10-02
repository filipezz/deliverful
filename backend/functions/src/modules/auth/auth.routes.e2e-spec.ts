import Faker from 'faker'
import request from 'supertest'
import firebase from 'firebase'
import { clearFirestoreData } from '../../test/firebase-helpers'
import {
  LoginPayloadDTO,
  RegisterPayloadDTO
} from 'deliverful-types/auth/dtos'
import {
  mockRegisterPayloadDTO
} from './dtos/test/mock-register-payload.dto'
import { getFirApp } from '../../config/firebase'
import { authApp as server } from './index'
import { adminApp } from '../../config/firebase-admin'
import { AuthUserMock, mockAuthUser } from '../../test/users-helpers'
import admin from 'firebase-admin'
import { mockLoginPayloadDTO } from './dtos/test/mock-login-payload.dto'

// eslint-disable-next-line no-shadow
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

describe('Auth Routes', () => {
  const baseURL = '/auth'
  let agentTest: request.SuperTest<request.Test>
  let firApp: firebase.app.App

  beforeEach(() => {
    agentTest = request(server)
    firApp = getFirApp()
  })

  afterEach(async () => {
    await clearFirestoreData()
  })

  describe('POST /signin', () => {
    const endpointURL = `${baseURL}/signin`
    let requestTest: request.Test

    beforeEach(() => {
      requestTest = agentTest.post(endpointURL)
    })

    it('should return 400, if request body.email is missing', async () => {
      await requestTest.send({}).expect(400, {
        error: 'Bad Request',
        message: 'celebrate request validation failed',
        statusCode: 400,
        validation: {
          body: {
            keys: ['email'],
            message: '"email" is required',
            source: 'body'
          }
        }
      })
    })

    it('should return 400, if request body.email is invalid', async () => {
      await requestTest.send({ email: 'invalid_email' }).expect(400, {
        error: 'Bad Request',
        message: 'celebrate request validation failed',
        statusCode: 400,
        validation: {
          body: {
            keys: ['email'],
            message: '"email" must be a valid email',
            source: 'body'
          }
        }
      })
    })

    describe('with valid request body.email value', () => {
      let loginPayloadDTO: LoginPayloadDTO

      beforeEach(() => {
        loginPayloadDTO = mockLoginPayloadDTO()
      })

      it('should return 400, if request body.password is missing', async () => {
        await requestTest
          .send({ ...loginPayloadDTO, password: undefined })
          .expect(400, {
            error: 'Bad Request',
            message: 'celebrate request validation failed',
            statusCode: 400,
            validation: {
              body: {
                keys: ['password'],
                message: '"password" is required',
                source: 'body'
              }
            }
          })
      })

      it('should return 400, if request body.password is invalid', async () => {
        await requestTest
          .send({ ...loginPayloadDTO, password: 0 })
          .expect(400, {
            error: 'Bad Request',
            message: 'celebrate request validation failed',
            statusCode: 400,
            validation: {
              body: {
                keys: ['password'],
                message: '"password" must be a string',
                source: 'body'
              }
            }
          })
      })

      describe('with valid request body, but invalid credentials', () => {
        it('should return 400, if login failed with auth/user-not-found', async () => {
          const error = { code: 'auth/user-not-found' }
          jest
            .spyOn(firApp.auth(), 'signInWithEmailAndPassword')
            .mockRejectedValueOnce(error)

          await requestTest.send(loginPayloadDTO).expect(401, {
            title: 'Sign in failed',
            message: 'Wrong identifier.',
            error
          })
        })

        it('should return 400, if login failed with auth/wrong-password', async () => {
          const error = { code: 'auth/wrong-password' }
          jest
            .spyOn(firApp.auth(), 'signInWithEmailAndPassword')
            .mockRejectedValueOnce(error)

          await requestTest.send(loginPayloadDTO).expect(401, {
            title: 'Sign in failed',
            message: 'Wrong password.',
            error
          })
        })
      })

      it('should return 500, if unknown error occurs', async () => {
        const unknownError = {}
        jest
          .spyOn(firApp.auth(), 'signInWithEmailAndPassword')
          .mockRejectedValueOnce(unknownError)

        await requestTest.send(loginPayloadDTO).expect(500, {
          title: 'Internal server error',
          message: 'Something unexpected happened. Please, try again.',
          error: {}
        })
      })

      describe('with valid user credentials', () => {
        let userCredential: any

        beforeEach(() => {
          userCredential = {
            user: { uid: Faker.random.uuid(), email: loginPayloadDTO.email }
          }
          jest
            .spyOn(firApp.auth(), 'signInWithEmailAndPassword')
            .mockResolvedValueOnce(userCredential)
        })

        it('should return 200, with correct user credential', async () => {
          await requestTest.send(loginPayloadDTO).expect(200, userCredential)
        })
      })
    })
  })

  describe('POST /signout', () => {
    const endpointURL = `${baseURL}/signout`
    let requestTest: request.Test

    beforeEach(() => {
      requestTest = agentTest.post(endpointURL)
    })

    it('should return 401, if header Authorization is not set', async () => {
      await requestTest.expect(401, {
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
        jest
          .spyOn(adminApp.auth(), 'revokeRefreshTokens')
          .mockResolvedValueOnce()
        requestTest.set('Authorization', authUser.token)
      })

      it('should return 204, on success', async () => {
        await requestTest.expect(204)
      })
    })
  })

  describe('POST /register', () => {
    const endpointURL = `${baseURL}/register`
    let requestTest: request.Test
    let registerPayloadDTO: RegisterPayloadDTO

    beforeEach(() => {
      requestTest = agentTest.post(endpointURL)
    })

    it('should return 400, if request body.email is missing', async () => {
      await requestTest
        .send({})
        .expect(400, {
          error: 'Bad Request',
          message: 'celebrate request validation failed',
          statusCode: 400,
          validation: {
            body: {
              keys: ['email'],
              message: '"email" is required',
              source: 'body'
            }
          }
        })
    })

    it('should return 400, if request body.email is invalid', async () => {
      await requestTest
        .send({
          email: 'invalid_email'
        })
        .expect(400, {
          error: 'Bad Request',
          message: 'celebrate request validation failed',
          statusCode: 400,
          validation: {
            body: {
              keys: ['email'],
              message: '"email" must be a valid email',
              source: 'body'
            }
          }
        })
    })

    it('should return 400, if request body.password is missing', async () => {
      await requestTest
        .send({
          email: Faker.internet.email()
        })
        .expect(400, {
          error: 'Bad Request',
          message: 'celebrate request validation failed',
          statusCode: 400,
          validation: {
            body: {
              keys: ['password'],
              message: '"password" is required',
              source: 'body'
            }
          }
        })
    })

    it('should return 400, if request body.password is invalid', async () => {
      await requestTest
        .send({
          email: Faker.internet.email(),
          password: 0
        })
        .expect(400, {
          error: 'Bad Request',
          message: 'celebrate request validation failed',
          statusCode: 400,
          validation: {
            body: {
              keys: ['password'],
              message: '"password" must be a string',
              source: 'body'
            }
          }
        })
    })

    it('should return 400, if request body.profile.name is invalid', async () => {
      await requestTest.send({
        email: Faker.internet.email(),
        password: Faker.internet.password(),
        profile: {
          name: 0
        }
      }).expect(400, {
        error: 'Bad Request',
        message: 'celebrate request validation failed',
        statusCode: 400,
        validation: {
          body: {
            keys: ['profile.name'],
            message: '"profile.name" must be a string',
            source: 'body'
          }
        }
      })
    })

    it('should return 400, if request body.profile.email is invalid', async () => {
      await requestTest.send({
        email: Faker.internet.email(),
        password: Faker.internet.password(),
        profile: {
          email: 0
        }
      }).expect(400, {
        error: 'Bad Request',
        message: 'celebrate request validation failed',
        statusCode: 400,
        validation: {
          body: {
            keys: ['profile.email'],
            message: '"profile.email" must be a string',
            source: 'body'
          }
        }
      })
    })

    it('should return 400, if request body.profile.phone is invalid', async () => {
      await requestTest.send({
        email: Faker.internet.email(),
        password: Faker.internet.password(),
        profile: {
          phone: 0
        }
      }).expect(400, {
        error: 'Bad Request',
        message: 'celebrate request validation failed',
        statusCode: 400,
        validation: {
          body: {
            keys: ['profile.phone'],
            message: '"profile.phone" must be a string',
            source: 'body'
          }
        }
      })
    })

    it('should return 400, if request body.profile.name is invalid', async () => {
      await requestTest.send({
        email: Faker.internet.email(),
        password: Faker.internet.password(),
        profile: {
          picture: 0
        }
      }).expect(400, {
        error: 'Bad Request',
        message: 'celebrate request validation failed',
        statusCode: 400,
        validation: {
          body: {
            keys: ['profile.picture'],
            message: '"profile.picture" must be a string',
            source: 'body'
          }
        }
      })
    })

    describe('with valid request body', () => {
      beforeEach(() => {
        registerPayloadDTO = mockRegisterPayloadDTO()
        requestTest.send(registerPayloadDTO)
      })

      it('should return 500, if unknown error occurs', async () => {
        const unknownError = {}
        jest
          .spyOn(firApp.auth(), 'createUserWithEmailAndPassword')
          .mockRejectedValueOnce(unknownError)

        await requestTest
          .expect(500, {
            title: 'Internal server error',
            message: 'Something unexpected happened. Please, try again.',
            error: {}
          })
      })

      describe('with valid request body', () => {
        let userCredential: any

        beforeEach(() => {
          userCredential = {
            user: {
              toJSON() {
                return userCredential.userData
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
          jest
            .spyOn(firApp.auth(), 'createUserWithEmailAndPassword')
            .mockResolvedValueOnce(userCredential)
        })

        it('should return 200, with created user and profile', async () => {
          await requestTest
            .expect(200)
            .expect(({ body }) => {
              expect(body).toEqual({
                user: {
                  uid: userCredential.userData.uid,
                  token: userCredential.userData.stsTokenManager
                },
                profile: {
                  _namespace: '',
                  id: userCredential.userData.uid,
                  uid: userCredential.userData.uid,
                  email: registerPayloadDTO.email,
                  picturesGallery: [],
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String)
                }
              })
            })
        })
      })
    })
  })
})
