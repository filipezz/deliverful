import request from 'supertest'
import Faker from 'faker'
import admin from 'firebase-admin'
import { getFirestore, tearDown } from '../../test/firebase-helpers'
import { mockAuthUser, AuthUserMock } from '../../test/users-helpers'
import { UserProfileDTO } from 'deliverful-types/profiles/dtos/user-profile.dto'
import { mockSaveUserProfileDTO } from './dtos/test/mock-save-user-profile.dto'
import { mockUserProfileDTO, mockUserWorkPreferencesDTO } from './test/mock-profiles.repository'
import { mockSaveWorkPreferencesDTO } from './dtos/test/mock-save-work-preferences.dto'
import { profilesApp as server } from '.'
import { adminApp } from '../../config/firebase-admin'
import { ArgyleService } from '../../services/argyle/argyle.service'
import { mockGigExperienceDTOs } from '../../services/argyle/test/mock-argyle.service'
import { mockUserDriverDTO } from '../drivers/test/mock-drivers.repository'

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

describe('Profiles Routes', () => {
  const baseURL = '/profiles'
  const meURL = baseURL + '/me'
  let agentTest: request.SuperTest<request.Test>

  beforeEach(() => {
    agentTest = request(server)
  })

  afterEach(async () => {
    await tearDown()
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
      let firestore: FirebaseFirestore.Firestore
      let usersRef: FirebaseFirestore.CollectionReference
      let profilesRef: FirebaseFirestore.CollectionReference
      let workPreferencesRef: FirebaseFirestore.CollectionReference
      let driversRef: FirebaseFirestore.CollectionReference

      let authUser: AuthUserMock
      const expectedResponse: {
        info: any,
        gigs: any[],
        workPreferences: any,
        driver: any
      } = {
        info: null,
        gigs: [],
        workPreferences: null,
        driver: null
      }

      beforeEach(() => {
        firestore = getFirestore()
        usersRef = firestore.collection('users')
        profilesRef = firestore.collection('profiles')
        workPreferencesRef = firestore.collection('workPreferences')
        driversRef = firestore.collection('drivers')

        authUser = mockAuthRequest(adminApp)
        requestTest.set('Authorization', authUser.token)

        expectedResponse.info = null
        expectedResponse.gigs = []
        expectedResponse.workPreferences = null
        expectedResponse.driver = null
      })

      it('should return 200 with empty gigs, if User argyle not exists', async () => {
        const { user } = authUser
        const userProfileData = { ...mockUserProfileDTO(), uid: user.uid, id: user.uid }
        await profilesRef.doc(user.uid).set(userProfileData)
        expectedResponse.info = {
          ...userProfileData,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }

        await requestTest
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual(expectedResponse)
          })
      })

      it('should return 200 with empty workPreferences, if not exists', async () => {
        const { user } = authUser
        const argyleGigExperienceDTOs = mockGigExperienceDTOs()
        jest.spyOn(ArgyleService.getInstance(), 'listGigExperiences')
          .mockResolvedValueOnce(argyleGigExperienceDTOs)
        await usersRef.doc(user.uid).set({ argyle: {} })
        const userProfileData = { ...mockUserProfileDTO(), uid: user.uid, id: user.uid }
        await profilesRef.doc(user.uid).set(userProfileData)
        expectedResponse.info = {
          ...userProfileData,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
        expectedResponse.gigs = argyleGigExperienceDTOs.map(item => ({
          ...item,
          hireDatetime: expect.any(String),
          terminationDatetime: expect.any(String)
        }))

        await requestTest
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual(expectedResponse)
          })
      })

      it('should return 200 with empty driver, if not exists', async () => {
        const { user } = authUser
        const argyleGigExperienceDTOs = mockGigExperienceDTOs()
        jest.spyOn(ArgyleService.getInstance(), 'listGigExperiences')
          .mockResolvedValueOnce(argyleGigExperienceDTOs)
        await usersRef.doc(user.uid).set({ argyle: {} })
        const userProfileData = { ...mockUserProfileDTO(), uid: user.uid, id: user.uid }
        await profilesRef.doc(user.uid).set(userProfileData)
        const workPreferencesData = mockUserWorkPreferencesDTO()
        await workPreferencesRef.doc(user.uid).set(workPreferencesData)
        expectedResponse.info = {
          ...userProfileData,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
        expectedResponse.gigs = argyleGigExperienceDTOs.map(item => ({
          ...item,
          hireDatetime: expect.any(String),
          terminationDatetime: expect.any(String)
        }))
        expectedResponse.workPreferences = {
          ...workPreferencesData,
          willingToStartAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: user.uid,
          uid: user.uid
        }

        await requestTest
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual(expectedResponse)
          })
      })

      it('should return 200 with correct response data', async () => {
        const { user } = authUser
        const argyleGigExperienceDTOs = mockGigExperienceDTOs()
        jest.spyOn(ArgyleService.getInstance(), 'listGigExperiences')
          .mockResolvedValueOnce(argyleGigExperienceDTOs)
        await usersRef.doc(user.uid).set({ argyle: {} })
        const userProfileData = { ...mockUserProfileDTO(), uid: user.uid, id: user.uid }
        await profilesRef.doc(user.uid).set(userProfileData)
        const workPreferencesData = mockUserWorkPreferencesDTO()
        await workPreferencesRef.doc(user.uid).set(workPreferencesData)
        const userDriverData = mockUserDriverDTO()
        await driversRef.doc(user.uid).set(userDriverData)
        expectedResponse.info = {
          ...userProfileData,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
        expectedResponse.gigs = argyleGigExperienceDTOs.map(item => ({
          ...item,
          hireDatetime: expect.any(String),
          terminationDatetime: expect.any(String)
        }))
        expectedResponse.workPreferences = {
          ...workPreferencesData,
          willingToStartAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: user.uid,
          uid: user.uid
        }
        expectedResponse.driver = {
          id: user.uid,
          uid: user.uid,
          license: {
            ...userDriverData.license,
            issuedDate: expect.any(String),
            expirationDate: expect.any(String)
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }

        await requestTest
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual(expectedResponse)
          })
      })
    })
  })

  describe('POST /me', () => {
    const endpointURL = meURL
    let requestTest: request.Test

    beforeEach(() => {
      requestTest = agentTest.post(endpointURL)
    })

    it('should return 400 if request body.name is invalid', async () => {
      await requestTest
        .send({
          name: 0
        })
        .expect(400, {
          error: 'Bad Request',
          message: 'celebrate request validation failed',
          statusCode: 400,
          validation: {
            body: {
              keys: ['name'],
              message: '"name" must be a string',
              source: 'body'
            }
          }
        })
    })

    it('should return 400 if request body.email is invalid', async () => {
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

    it('should return 400 if request body.phone is invalid', async () => {
      await requestTest.send({
        phone: 0
      })
      .expect(400, {
        error: 'Bad Request',
        message: 'celebrate request validation failed',
        statusCode: 400,
        validation: {
          body: {
            keys: ['phone'],
            message: '"phone" must be a string',
            source: 'body'
          }
        }
      })
    })

    it('should return 400 if request body.picture is invalid', async () => {
      await requestTest
        .send({
          picture: 0
        })
        .expect(400, {
          error: 'Bad Request',
          message: 'celebrate request validation failed',
          statusCode: 400,
          validation: {
            body: {
              keys: ['picture'],
              message: '"picture" must be a string',
              source: 'body'
            }
          }
        })
    })

    it('should return 400 if request body.address.line1 is invalid', async () => {
      await requestTest
        .send({
          address: {
            line1: 0
          }
        })
        .expect(400, {
          error: 'Bad Request',
          message: 'celebrate request validation failed',
          statusCode: 400,
          validation: {
            body: {
              keys: ['address.line1'],
              message: '"address.line1" must be a string',
              source: 'body'
            }
          }
        })
    })

    it('should return 400 if request body.address.line2 is invalid', async () => {
      await requestTest
        .send({
          address: {
            line2: 0
          }
        })
        .expect(400, {
          error: 'Bad Request',
          message: 'celebrate request validation failed',
          statusCode: 400,
          validation: {
            body: {
              keys: ['address.line2'],
              message: '"address.line2" must be a string',
              source: 'body'
            }
          }
        })
    })

    it('should return 400 if request body.address.city is invalid', async () => {
      await requestTest
        .send({
          address: {
            city: 0
          }
        })
        .expect(400, {
          error: 'Bad Request',
          message: 'celebrate request validation failed',
          statusCode: 400,
          validation: {
            body: {
              keys: ['address.city'],
              message: '"address.city" must be a string',
              source: 'body'
            }
          }
        })
    })

    it('should return 400 if request body.address.state is invalid', async () => {
      await requestTest
        .send({
          address: {
            state: 0
          }
        })
        .expect(400, {
          error: 'Bad Request',
          message: 'celebrate request validation failed',
          statusCode: 400,
          validation: {
            body: {
              keys: ['address.state'],
              message: '"address.state" must be a string',
              source: 'body'
            }
          }
        })
    })

    it('should return 400 if request body.address.postalCode is invalid', async () => {
      await requestTest
        .send({
          address: {
            postalCode: 0
          }
        })
        .expect(400, {
          error: 'Bad Request',
          message: 'celebrate request validation failed',
          statusCode: 400,
          validation: {
            body: {
              keys: ['address.postalCode'],
              message: '"address.postalCode" must be a string',
              source: 'body'
            }
          }
        })
    })

    it('should return 400 if request body.address.country is invalid', async () => {
      await requestTest
        .send({
          address: {
            country: 0
          }
        })
        .expect(400, {
          error: 'Bad Request',
          message: 'celebrate request validation failed',
          statusCode: 400,
          validation: {
            body: {
              keys: ['address.country'],
              message: '"address.country" must be a string',
              source: 'body'
            }
          }
        })
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
      let profilesRef: FirebaseFirestore.CollectionReference
      let authUser: AuthUserMock

      beforeEach(() => {
        profilesRef = getFirestore().collection('profiles')

        authUser = mockAuthRequest(adminApp)
        requestTest.set('Authorization', authUser.token)
      })

      it('should return 200, with correct response data', async () => {
        const requestBody = mockSaveUserProfileDTO()
        const { user } = authUser
        const expectedResponse = {
          _namespace: '',
          id: user.uid,
          uid: user.uid,
          name: requestBody.name,
          email: requestBody.email,
          phone: requestBody.phone,
          address: requestBody.address,
          picture: requestBody.picture,
          picturesGallery: [requestBody.picture],
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        } as UserProfileDTO

        await requestTest
          .send(requestBody)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual(expectedResponse)
          })
      })

      describe('when user profile already exists', () => {
        it('should return 200, with appended pictures', async () => {
          const requestBody = mockSaveUserProfileDTO()
          const { user } = authUser
          const oldUserProfileData = mockUserProfileDTO()
          await profilesRef.doc(user.uid).set(oldUserProfileData)
          const expectedResponse = {
            _namespace: '',
            id: user.uid,
            uid: user.uid,
            name: requestBody.name,
            email: requestBody.email,
            phone: requestBody.phone,
            address: requestBody.address,
            picture: requestBody.picture,
            picturesGallery: [
              ...(oldUserProfileData.picturesGallery ?? []),
              requestBody.picture
            ],
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          } as UserProfileDTO

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

  describe('POST /me/work-preferences', () => {
    const endpointURL = `${meURL}/work-preferences`
    let requestTest: request.Test

    beforeEach(() => {
      requestTest = agentTest.post(endpointURL)
    })

    it('should return 400 if request body.willingToStartAt is invalid', async () => {
      await requestTest
        .send({
          willingToStartAt: ''
        })
        .expect(400, {
          error: 'Bad Request',
          message: 'celebrate request validation failed',
          statusCode: 400,
          validation: {
            body: {
              keys: ['willingToStartAt'],
              message: '"willingToStartAt" must be a valid date',
              source: 'body'
            }
          }
        })
    })

    it('should return 400, if request body.availability[0].startsAt is missing', async () => {
      await requestTest
        .send({
          availability: [{}]
        })
        .expect(400).expect(({ body } : any) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'celebrate request validation failed',
            statusCode: 400,
            validation: {
              body: {
                keys: ['availability.0.startsAt'],
                message: '"availability[0].startsAt" is required',
                source: 'body'
              }
            }
          })
        })
    })

    it('should return 400 if request body.availability[0].startsAt is invalid', async () => {
      await requestTest
        .send({
          availability: [{
            startsAt: 0
          }]
        })
        .expect(400).expect(({ body } : any) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'celebrate request validation failed',
            statusCode: 400,
            validation: {
              body: {
                keys: ['availability.0.startsAt'],
                message: '"availability[0].startsAt" must be a string',
                source: 'body'
              }
            }
          })
        })
    })

    it('should return 400, if request body.availability[0].endsAt is missing', async () => {
      await requestTest
        .send({
          availability: [{
            startsAt: 'any'
          }]
        })
        .expect(400).expect(({ body } : any) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'celebrate request validation failed',
            statusCode: 400,
            validation: {
              body: {
                keys: ['availability.0.endsAt'],
                message: '"availability[0].endsAt" is required',
                source: 'body'
              }
            }
          })
        })
    })

    it('should return 200 if request body.availability has null', async () => {
      const authUser = mockAuthRequest(adminApp)
      await requestTest.set('Authorization', authUser.token)
        .send({
          availability: [null]
        })
        .expect(200).expect(({ body } : any) => {
          expect(body).toEqual({
            availability: [null],
            createdAt: expect.any(String),
            id: authUser.user.uid,
            uid: authUser.user.uid,
            _namespace: '',
            updatedAt: expect.any(String)
          })
        })
    })

    it('should return 400 if request body.availability[0].endsAt is invalid', async () => {
      await requestTest
        .send({
          availability: [{
            startsAt: 'any',
            endsAt: 0
          }]
        })
        .expect(400).expect(({ body } : any) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'celebrate request validation failed',
            statusCode: 400,
            validation: {
              body: {
                keys: ['availability.0.endsAt'],
                message: '"availability[0].endsAt" must be a string',
                source: 'body'
              }
            }
          })
        })
    })

    it('should return 400, if request body.availability[0].endsAt is missing', async () => {
      await requestTest
        .send({
          availability: [{
            startsAt: 'any'
          }]
        })
        .expect(400).expect(({ body } : any) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'celebrate request validation failed',
            statusCode: 400,
            validation: {
              body: {
                keys: ['availability.0.endsAt'],
                message: '"availability[0].endsAt" is required',
                source: 'body'
              }
            }
          })
        })
    })

    it('should return 400 if request body.jobPositiontypes is invalid', async () => {
      await requestTest
        .send({
          jobPositionTypes: ['any_string']
        })
        .expect(400).expect(({ body } : any) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'celebrate request validation failed',
            statusCode: 400,
            validation: {
              body: {
                keys: ['jobPositionTypes.0'],
                message: '"jobPositionTypes[0]" must be one of [Full-time, Part-time, Split shifts, Contract, Seasonal, Temporary]',
                source: 'body'
              }
            }
          })
        })
    })

    it('should return 400 if request body.workingRadius is invalid', async () => {
      await requestTest
        .send({
          workingRadius: ['any_string']
        })
        .expect(400).expect(({ body } : any) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'celebrate request validation failed',
            statusCode: 400,
            validation: {
              body: {
                keys: ['workingRadius.0'],
                message: '"workingRadius[0]" must be a number',
                source: 'body'
              }
            }
          })
        })
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
        const requestBody = mockSaveWorkPreferencesDTO()
        const { user } = authUser
        const expectedResponse = {
          _namespace: '',
          id: user.uid,
          uid: user.uid,
          ...requestBody,
          willingToStartAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }

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