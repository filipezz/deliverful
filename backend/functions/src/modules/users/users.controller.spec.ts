import Faker from 'faker'
import { Request } from 'express'
import {
  HttpCode,
  HttpErrorCode,
  HttpInternalServerError,
  HttpJsonErrorResponse,
  HttpJsonResponse
} from '../../helpers/http.helpers'
import { UsersRepositorySpy } from './test/mock-users.repository'
import { UsersController } from './users.controller'
import { mockSaveArgyleUserDTO } from './dtos/test/mock-save-argyle-user.dto'
import { ArgyleServiceSpy } from '../../services/argyle/test/mock-argyle.service'
import { SaveUserProfileDTO } from 'deliverful-types/profiles/dtos'
import { ProfilesRepositorySpy } from '../profiles/test/mock-profiles.repository'
import { DriversRepositorySpy } from '../drivers/test/mock-drivers.repository'
import { SaveUserDriverDTO } from 'deliverful-types/drivers/dtos'

type ISutTypes = {
  controller: UsersController
  usersRepository: UsersRepositorySpy
  profilesRepository: ProfilesRepositorySpy
  argyleService: ArgyleServiceSpy
  driversRepository: DriversRepositorySpy
};

function makeSut(): ISutTypes {
  const usersRepository = new UsersRepositorySpy()
  const profilesRepository = new ProfilesRepositorySpy()
  const argyleService = new ArgyleServiceSpy()
  const driversRepository = new DriversRepositorySpy()
  const controller = new UsersController(
    usersRepository,
    profilesRepository,
    argyleService,
    driversRepository
  )

  return {
    controller,
    usersRepository,
    profilesRepository,
    argyleService,
    driversRepository
  }
}

describe('Users Controller', () => {
  let sut: ISutTypes

  beforeEach(() => {
    sut = makeSut()
  })

  describe('saveArgyleUser()', () => {
    let httpRequest: Partial<Request>

    beforeEach(() => {
      httpRequest = {
        user: {
          uid: Faker.random.alphaNumeric(18)
        },
        body: mockSaveArgyleUserDTO()
      }
    })

    describe('Users Repository', () => {
      it('should call saveArgyleUser() with correct "dto"', async () => {
        const saveArgyleUserSpy = jest.spyOn(sut.usersRepository, 'saveArgyleUser')

        await sut.controller.saveArgyleUser(httpRequest)

        expect(saveArgyleUserSpy).toHaveBeenCalledTimes(1)
        expect(saveArgyleUserSpy).toHaveBeenCalledWith(httpRequest.user.uid, httpRequest.body)
      })
    })

    it('should return HttpJsonResponse with User, on success', async () => {
      const result = await sut.controller.saveArgyleUser(httpRequest)

      expect(result).toEqual(
        new HttpJsonResponse(sut.usersRepository.userDTO)
      )
    })
  })

  describe('saveArgyleUserAccount()', () => {
    let httpRequest: Partial<Request>

    beforeEach(() => {
      httpRequest = {
        user: {
          uid: Faker.random.alphaNumeric(18)
        },
        body: {
          accountId: Faker.random.uuid()
        }
      }
    })

    describe('Users Repository', () => {
      describe('getUser()', () => {
        it('should call getUser() with correct "uid"', async () => {
          const getUserSpy = jest.spyOn(sut.usersRepository, 'getUser')

          await sut.controller.saveArgyleUserAccount(httpRequest)

          expect(getUserSpy).toHaveBeenCalledTimes(1)
          expect(getUserSpy).toHaveBeenCalledWith(httpRequest.user.uid)
        })

        it('should return HttpJsonErrorResponse, if User argyle not exists', async () => {
          sut.usersRepository.userDTO.argyle = undefined

          const result = await sut.controller.saveArgyleUserAccount(httpRequest)

          expect(result).toEqual(
            new HttpJsonErrorResponse(
              'Action forbidden',
              'User argyle not found for current user',
              undefined,
              HttpErrorCode.forbiddenError
            )
          )
        })
      })
    })

    describe('_saveUserProfile()', () => {
      it('should call _saveUserProfile() with correct params', async () => {
        const _saveUserProfileSpy = jest.spyOn(sut.controller, '_saveUserProfile')

        await sut.controller.saveArgyleUserAccount(httpRequest)

        expect(_saveUserProfileSpy).toHaveBeenCalledTimes(1)
        expect(_saveUserProfileSpy).toHaveBeenCalledWith(
          sut.usersRepository.userDTO,
          httpRequest
        )
      })

      it('should return HttpInternalServerError if _saveUserProfile() throws', async () => {
        const error = new Error('_saveUserProfile() Error')
        jest.spyOn(sut.controller, '_saveUserProfile')
          .mockRejectedValueOnce(error)

        const result = await sut.controller.saveArgyleUserAccount(httpRequest)

        expect(result).toEqual(
          new HttpInternalServerError(error)
        )
      })
    })

    describe('_saveUserDriver()', () => {
      it('should call _saveUserDriver() with correct params', async () => {
        const _saveUserDriverSpy = jest.spyOn(sut.controller, '_saveUserDriver')

        await sut.controller.saveArgyleUserAccount(httpRequest)

        expect(_saveUserDriverSpy).toHaveBeenCalledTimes(1)
        expect(_saveUserDriverSpy).toHaveBeenCalledWith(
          sut.usersRepository.userDTO,
          httpRequest
        )
      })

      it('should return HttpInternalServerError if _saveUserDriver() throws', async () => {
        const error = new Error('_saveUserDriver() Error')
        jest.spyOn(sut.controller, '_saveUserDriver')
          .mockRejectedValueOnce(error)

        const result = await sut.controller.saveArgyleUserAccount(httpRequest)

        expect(result).toEqual(
          new HttpInternalServerError(error)
        )
      })
    })

    it('should return HttpJsonResponse without any content, on success', async () => {
      const result = await sut.controller.saveArgyleUserAccount(httpRequest)

      expect(result).toEqual(
        new HttpJsonResponse(undefined, HttpCode.noContent)
      )
    })
  })

  describe('getUser()', () => {
    let httpRequest: Partial<Request>

    beforeEach(() => {
      httpRequest = {
        user: {
          uid: Faker.random.alphaNumeric(18)
        }
      }
    })


    describe('Users Repository', () => {
      it('should call getUser() with correct "uid"', async () => {
        const getUserSpy = jest.spyOn(sut.usersRepository, 'getUser')

        await sut.controller.getUser(httpRequest)

        expect(getUserSpy).toHaveBeenCalledTimes(1)
        expect(getUserSpy).toHaveBeenCalledWith(httpRequest.user.uid)
      })
    })

    it('should return HttpJsonResponse with User, on success', async () => {
      const result = await sut.controller.getUser(httpRequest)

      expect(result).toEqual(new HttpJsonResponse(sut.usersRepository.userDTO))
    })
  })

  describe('refreshArgyleUserToken()', () => {
    let httpRequest: Partial<Request>

    beforeEach(() => {
      httpRequest = {
        user: {
          uid: Faker.random.alphaNumeric(18)
        }
      }
    })


    describe('Users Repository', () => {
      describe('getUser()', () => {
        it('should call getUser() with correct "uid"', async () => {
          const getUserSpy = jest.spyOn(sut.usersRepository, 'getUser')

          await sut.controller.refreshArgyleUserToken(httpRequest)

          expect(getUserSpy).toHaveBeenCalledTimes(1)
          expect(getUserSpy).toHaveBeenCalledWith(httpRequest.user.uid)
        })

        it('should return HttpJsonErrorResponse, if User argyle not exists', async () => {
          sut.usersRepository.userDTO.argyle = undefined

          const result = await sut.controller.refreshArgyleUserToken(httpRequest)

          expect(result).toEqual(
            new HttpJsonErrorResponse(
              'Action forbidden',
              'User argyle not found for current user',
              undefined,
              HttpErrorCode.forbiddenError
            )
          )
        })
      })

      describe('saveArgyleUser()', () => {
        it('should call saveArgyleUser() with correct params', async () => {
          const saveArgyleUserSpy = jest.spyOn(sut.usersRepository, 'saveArgyleUser')
          const userDTO = sut.usersRepository.userDTO,
            userTokenPayload = sut.argyleService.userTokenPayload

          await sut.controller.refreshArgyleUserToken(httpRequest)

          expect(saveArgyleUserSpy).toHaveBeenCalledTimes(1)
          expect(saveArgyleUserSpy).toHaveBeenCalledWith(userDTO.uid, {
            userId: userDTO.argyle?.userId,
            userToken: userTokenPayload.access
          })
        })
      })
    })

    describe('Argyle Service', () => {
      it('should call createUserToken() with correct "userId"', async () => {
        const createUserTokenSpy = jest.spyOn(sut.argyleService, 'createUserToken')

        await sut.controller.refreshArgyleUserToken(httpRequest)

        expect(createUserTokenSpy).toHaveBeenCalledTimes(1)
        expect(createUserTokenSpy).toHaveBeenCalledWith(
          sut.usersRepository.userDTO.argyle?.userId
        )
      })

      it('should return HttpJsonErrorResponse, if createUserToken() throws', async () => {
        const error = new Error('[ArgyleService] createUserToken() error')
        jest.spyOn(sut.argyleService, 'createUserToken').mockRejectedValueOnce(error)

        const result = await sut.controller.refreshArgyleUserToken(httpRequest)

        expect(result).toEqual(new HttpInternalServerError(error))
      })
    })

    it('should return HttpJsonResponse with User, on success', async () => {
      const result = await sut.controller.refreshArgyleUserToken(httpRequest)

      expect(result).toEqual(
        new HttpJsonResponse(sut.usersRepository.userDTO)
      )
    })
  })

  describe('_saveUserProfile()', () => {
    let httpRequest: Partial<Request>

    beforeEach(() => {
      httpRequest = {
        user: {
          uid: Faker.random.alphaNumeric(18)
        },
        body: {
          accountId: Faker.random.uuid()
        }
      }
    })

    describe('Profiles Repository', () => {
      describe('getProfile()', () => {
        it('should call getProfile() with correct params', async () => {
          const getProfileSpy = jest.spyOn(sut.profilesRepository, 'getProfile')

          await sut.controller._saveUserProfile(sut.usersRepository.userDTO, httpRequest)

          expect(getProfileSpy).toHaveBeenCalledTimes(1)
          expect(getProfileSpy).toHaveBeenCalledWith(httpRequest.user.uid)
        })
      })

      describe('saveProfile()', () => {
        it('should call saveProfile() with correct params', async () => {
          const saveProfileSpy = jest.spyOn(sut.profilesRepository, 'saveProfile')
          jest.spyOn(sut.profilesRepository, 'getProfile').mockResolvedValueOnce(null)
          const expectedSaveUserProfileDTO: SaveUserProfileDTO = {
            email: sut.argyleService.userProfileDTO.email,
            name: sut.argyleService.userProfileDTO.fullName,
            phone: sut.argyleService.userProfileDTO.phoneNumber,
            picture: sut.argyleService.userProfileDTO.pictureUrl,
            address: sut.argyleService.userProfileDTO.address
          }

          await sut.controller._saveUserProfile(sut.usersRepository.userDTO, httpRequest)

          expect(saveProfileSpy).toHaveBeenCalledTimes(1)
          expect(saveProfileSpy).toHaveBeenCalledWith(
            httpRequest.user.uid,
            expectedSaveUserProfileDTO,
            false
          )
        })

        describe('when UserProfile already exists', () => {
          it('should only override SaveProfileDTO params, if necessary (not exists)', async () => {
            const saveProfileSpy = jest.spyOn(sut.profilesRepository, 'saveProfile')
            jest.spyOn(sut.profilesRepository, 'getProfile').mockResolvedValueOnce({
              ...sut.profilesRepository.userProfileDTO,
              name: undefined,
              phone: undefined,
              address: {
                ...sut.profilesRepository.userProfileDTO.address,
                line2: undefined,
                country: undefined
              }
            })
            const expectedSaveUserProfileDTO: SaveUserProfileDTO = {
              email: sut.profilesRepository.userProfileDTO.email,
              name: sut.argyleService.userProfileDTO.fullName,
              phone: sut.argyleService.userProfileDTO.phoneNumber,
              picture: sut.argyleService.userProfileDTO.pictureUrl,
              address: {
                ...sut.profilesRepository.userProfileDTO.address,
                line2: sut.argyleService.userProfileDTO.address?.line2,
                country: sut.argyleService.userProfileDTO.address?.country
              }
            }

            await sut.controller._saveUserProfile(sut.usersRepository.userDTO, httpRequest)

            expect(saveProfileSpy).toHaveBeenCalledTimes(1)
            expect(saveProfileSpy).toHaveBeenCalledWith(
              httpRequest.user.uid,
              expectedSaveUserProfileDTO,
              false
            )
          })
        })
      })
    })

    describe('Argyle Service', () => {
      it('should call loadUserProfile() with correct params', async () => {
        const loadUserProfileSpy = jest.spyOn(sut.argyleService, 'loadUserProfile')

        await sut.controller._saveUserProfile(sut.usersRepository.userDTO, httpRequest)

        expect(loadUserProfileSpy).toHaveBeenCalledTimes(1)
        expect(loadUserProfileSpy).toHaveBeenCalledWith(
          sut.usersRepository.userDTO.argyle?.userId,
          httpRequest.body.accountId
        )
      })
    })
  })

  describe('_saveUserDriver()', () => {
    let httpRequest: Partial<Request>

    beforeEach(() => {
      httpRequest = {
        user: {
          uid: Faker.random.alphaNumeric(18)
        },
        body: {
          accountId: Faker.random.uuid()
        }
      }
    })

    describe('Drivers Repository', () => {
      describe('getDriver()', () => {
        it('should call getDriver() with correct params', async () => {
          const getDriverSpy = jest.spyOn(sut.driversRepository, 'getDriver')

          await sut.controller._saveUserDriver(sut.usersRepository.userDTO, httpRequest)

          expect(getDriverSpy).toHaveBeenCalledTimes(1)
          expect(getDriverSpy).toHaveBeenCalledWith(httpRequest.user.uid)
        })
      })

      describe('saveDriver()', () => {
        it('should call saveDriver() with correct params', async () => {
          const saveDriverSpy = jest.spyOn(sut.driversRepository, 'saveDriver')
          jest.spyOn(sut.driversRepository, 'getDriver').mockResolvedValueOnce(null)
          const expectedSaveUserDriverDTO: SaveUserDriverDTO = {
            license: {
              number: sut.argyleService.userDocumentDTO.number,
              issuedDate: sut.argyleService.userDocumentDTO.issuedDate,
              expirationDate: sut.argyleService.userDocumentDTO.expirationDate,
              frontFileUrl: sut.argyleService.userDocumentDTO.fileUrl
            }
          }

          await sut.controller._saveUserDriver(sut.usersRepository.userDTO, httpRequest)

          expect(saveDriverSpy).toHaveBeenCalledTimes(1)
          expect(saveDriverSpy).toHaveBeenCalledWith(
            httpRequest.user.uid,
            expectedSaveUserDriverDTO
          )
        })

        describe('when UserDriver already exists', () => {
          it('should only override SaveUserDriverDTO params, if necessary (not exists)', async () => {
            const saveProfileSpy = jest.spyOn(sut.driversRepository, 'saveDriver')
            jest.spyOn(sut.driversRepository, 'getDriver').mockResolvedValueOnce({
              ...sut.driversRepository.userDriverDTO,
              license: {
                ...sut.driversRepository.userDriverDTO.license,
                expirationDate: undefined,
                frontFileUrl: undefined
              }
            })
            const expectedSaveUserDriverDTO: SaveUserDriverDTO = {
              license: {
                ...sut.driversRepository.userDriverDTO.license,
                expirationDate: sut.argyleService.userDocumentDTO?.expirationDate,
                frontFileUrl: sut.argyleService.userDocumentDTO?.fileUrl,
                backFileUrl: undefined
              }
            }

            await sut.controller._saveUserDriver(sut.usersRepository.userDTO, httpRequest)

            expect(saveProfileSpy).toHaveBeenCalledTimes(1)
            expect(saveProfileSpy).toHaveBeenCalledWith(
              httpRequest.user.uid,
              expectedSaveUserDriverDTO
            )
          })
        })
      })
    })

    describe('Argyle Service', () => {
      it('should call loadUserDocumentForType() with correct params', async () => {
        const loadUserDocumentForTypeSpy = jest.spyOn(sut.argyleService, 'loadUserDocumentForType')

        await sut.controller._saveUserDriver(sut.usersRepository.userDTO, httpRequest)

        expect(loadUserDocumentForTypeSpy).toHaveBeenCalledTimes(1)
        expect(loadUserDocumentForTypeSpy).toHaveBeenCalledWith(
          {
            userId: sut.usersRepository.userDTO.argyle?.userId,
            accountId: httpRequest.body.accountId
          },
          'drivers-licence'
        )
      })
    })
  })
})
