import Faker from 'faker'
import Mockdate from 'mockdate'
import { Request } from 'express'
import {
  HttpErrorCode,
  HttpJsonErrorResponse,
  HttpJsonResponse
} from '../../helpers/http.helpers'
import { UsersRepositorySpy } from '../users/test/mock-users.repository'
import { ProfilesController } from './profiles.controller'
import { ArgyleServiceSpy } from '../../services/argyle/test/mock-argyle.service'
import { mockSaveUserProfileDTO } from './dtos/test/mock-save-user-profile.dto'
import { ProfilesRepositorySpy } from './test/mock-profiles.repository'
import { DatetimeValidationServiceSpy } from '../../validation/test/mock-datetime-validation.service'
import { mockSaveWorkPreferencesDTO } from './dtos/test/mock-save-work-preferences.dto'
import { DriversRepositorySpy } from '../drivers/test/mock-drivers.repository'

type ISutTypes = {
  controller: ProfilesController;
  profilesRepository: ProfilesRepositorySpy;
  usersRepository: UsersRepositorySpy;
  argyleService: ArgyleServiceSpy;
  datetimeValidationService: DatetimeValidationServiceSpy,
  driversRepository: DriversRepositorySpy
};

function makeSut(): ISutTypes {
  const profilesRepository = new ProfilesRepositorySpy()
  const usersRepository = new UsersRepositorySpy()
  const argyleService = new ArgyleServiceSpy()
  const datetimeValidationService = new DatetimeValidationServiceSpy()
  const driversRepository = new DriversRepositorySpy()
  const controller = new ProfilesController(
    profilesRepository,
    usersRepository,
    argyleService,
    datetimeValidationService,
    driversRepository
  )

  return {
    controller,
    profilesRepository,
    usersRepository,
    argyleService,
    datetimeValidationService,
    driversRepository
  }
}

describe('Profiles Controller', () => {
  let sut: ISutTypes

  beforeEach(() => {
    sut = makeSut()
  })

  describe('saveQuestionnaire()', () => {
    let httpRequest: Partial<Request>

    beforeEach(() => {
      httpRequest = {
        user: {
          uid: Faker.random.alphaNumeric(18)
        },
        body: [{
          'title': Faker.random.alphaNumeric(18),
          'label':Faker.random.alphaNumeric(18),
          'response':Faker.random.alphaNumeric(18)
        }]
      }
    })

    describe('Profiles Repository', () => {
      it('should call saveQuestionnaire() with correct params', async () => {
        const saveQuestionnaireSpy = jest.spyOn(sut.profilesRepository, 'saveQuestionnaire')

        await sut.controller.saveQuestionnaire(httpRequest)

        expect(saveQuestionnaireSpy).toHaveBeenCalledTimes(1)
        expect(saveQuestionnaireSpy).toHaveBeenCalledWith(
          httpRequest.user.uid,
          httpRequest.body
        )
      })
    })

    it('should return HttpJsonResponse with UserProfile, on success', async () => {
      const result = await sut.controller.saveProfile(httpRequest)

      expect(result).toEqual(
        new HttpJsonResponse(sut.profilesRepository.userProfileDTO)
      )
    })
  })

  describe('getProfile()', () => {
    let httpRequest: Partial<Request>

    beforeEach(() => {
      httpRequest = {
        user: {
          uid: Faker.random.alphaNumeric(18)
        }
      }
    })

    describe('Profiles Repository', () => {
      describe('getUser()', () => {
        it('should call getUser() with correct "uid"', async () => {
          const getUserSpy = jest.spyOn(sut.usersRepository, 'getUser')

          await sut.controller.getProfile(httpRequest)

          expect(getUserSpy).toHaveBeenCalledTimes(1)
          expect(getUserSpy).toHaveBeenCalledWith(httpRequest.user.uid)
        })
      })

      describe('getProfile()', () => {
        it('should call getProfile() with correct "uid"', async () => {
          const getProfileSpy = jest.spyOn(sut.profilesRepository, 'getProfile')

          await sut.controller.getProfile(httpRequest)

          expect(getProfileSpy).toHaveBeenCalledTimes(1)
          expect(getProfileSpy).toHaveBeenCalledWith(sut.usersRepository.userDTO.uid)
        })
      })

      describe('getWorkPreferences()', () => {
        it('should call getWorkPreferences() with correct "uid"', async () => {
          const getWorkPreferencesSpy = jest.spyOn(sut.profilesRepository, 'getWorkPreferences')

          await sut.controller.getProfile(httpRequest)

          expect(getWorkPreferencesSpy).toHaveBeenCalledTimes(1)
          expect(getWorkPreferencesSpy).toHaveBeenCalledWith(sut.usersRepository.userDTO.uid)
        })
      })
    })

    describe('Drivers Repository', () => {
      describe('getDriver()', () => {
        it('should call getDriver() with correct "uid"', async () => {
          const getDriverSpy = jest.spyOn(sut.driversRepository, 'getDriver')

          await sut.controller.getProfile(httpRequest)

          expect(getDriverSpy).toHaveBeenCalledTimes(1)
          expect(getDriverSpy).toHaveBeenCalledWith(sut.usersRepository.userDTO.uid)
        })
      })
    })

    describe('Argyle Service', () => {
      it('should call listGigExperiences() with correct "userId"', async () => {
        const listGigExperiencesSpy = jest.spyOn(sut.argyleService, 'listGigExperiences')

        await sut.controller.getProfile(httpRequest)

        expect(listGigExperiencesSpy).toHaveBeenCalledTimes(1)
        expect(listGigExperiencesSpy).toHaveBeenCalledWith(
          sut.usersRepository.userDTO.argyle?.userId
        )
      })
    })

    it('should return HttpJsonResponse without gigs, if User argyle not exists', async () => {
      sut.usersRepository.userDTO.argyle = undefined

      const result = await sut.controller.getProfile(httpRequest)

      expect(result).toEqual(
        new HttpJsonResponse({
          info: sut.profilesRepository.userProfileDTO,
          gigs: [],
          workPreferences: sut.profilesRepository.userWorkPreferencesDTO,
          driver: sut.driversRepository.userDriverDTO
        })
      )
    })

    it('should return HttpJsonResponse with correct data, on success', async () => {
      const result = await sut.controller.getProfile(httpRequest)

      expect(result).toEqual(
        new HttpJsonResponse({
          info: sut.profilesRepository.userProfileDTO,
          gigs: sut.argyleService.gigExperiences,
          workPreferences: sut.profilesRepository.userWorkPreferencesDTO,
          driver: sut.driversRepository.userDriverDTO
        })
      )
    })
  })

  describe('saveProfile()', () => {
    let httpRequest: Partial<Request>

    beforeEach(() => {
      httpRequest = {
        user: {
          uid: Faker.random.alphaNumeric(18)
        },
        body: mockSaveUserProfileDTO()
      }
    })

    describe('Profiles Repository', () => {
      it('should call saveProfile() with correct params', async () => {
        const saveProfileSpy = jest.spyOn(sut.profilesRepository, 'saveProfile')

        await sut.controller.saveProfile(httpRequest)

        expect(saveProfileSpy).toHaveBeenCalledTimes(1)
        expect(saveProfileSpy).toHaveBeenCalledWith(
          httpRequest.user.uid,
          httpRequest.body
        )
      })
    })

    it('should return HttpJsonResponse with UserProfile, on success', async () => {
      const result = await sut.controller.saveProfile(httpRequest)

      expect(result).toEqual(
        new HttpJsonResponse(sut.profilesRepository.userProfileDTO)
      )
    })
  })

  describe('saveWorkPreferences()', () => {
    let httpRequest: Partial<Request>

    beforeEach(() => {
      httpRequest = {
        user: {
          uid: Faker.random.alphaNumeric(18)
        },
        body: mockSaveWorkPreferencesDTO()
      }
    })

    describe('DatetimeValidation Service', () => {
      describe('isTimeString()', () => {
        it('should call isTimeString() with correct params', async () => {
          const isTimeStringSpy = jest.spyOn(sut.datetimeValidationService, 'isTimeString')
          const { availability } = httpRequest.body
          const providedAvailability = availability.filter((item: any[]) => {
            return item && Object.keys(item).length > 0
          })

          await sut.controller.saveWorkPreferences(httpRequest)

          expect(isTimeStringSpy).toHaveBeenCalledTimes(providedAvailability.length * 2)
          providedAvailability.forEach((item: any) => {
            expect(isTimeStringSpy).toHaveBeenCalledWith(item.startsAt)
            expect(isTimeStringSpy).toHaveBeenCalledWith(item.endsAt)
          })
        })

        it('should return HttpJsonErrorResponse, if isTimeString() returns false for any "startsAt"', async () => {
          const isTimeStringSpy = jest.spyOn(sut.datetimeValidationService, 'isTimeString')
          const { availability } = httpRequest.body
          let availabilityIdx = -1
          const availabilityValidation = availability.flatMap((_: any, idx: number) => {
            if (
              (_ && Object.keys(_).length > 0) &&
              availabilityIdx === -1
            ) {
              availabilityIdx = idx
              return [false, true]
            } else {
              return [true, true]
            }
          })
          availabilityValidation.forEach((returnValue: boolean) => {
            isTimeStringSpy.mockReturnValueOnce(returnValue)
          })

          const result = await sut.controller.saveWorkPreferences(httpRequest)

          expect(result).toEqual(
            new HttpJsonErrorResponse(
              'Invalid body property "availability"',
              `param availability[${availabilityIdx}].startsAt is malformed`,
              undefined,
              HttpErrorCode.validationError
            )
          )
        })

        it('should return HttpJsonErrorResponse, if isTimeString() returns false for any "endsAt"', async () => {
          const isTimeStringSpy = jest.spyOn(sut.datetimeValidationService, 'isTimeString')
          const { availability } = httpRequest.body
          let availabilityIdx = -1
          const availabilityValidation = availability.flatMap((_: any, idx: number) => {
            if (
              (_ && Object.keys(_).length > 0) &&
              availabilityIdx === -1
            ) {
              availabilityIdx = idx
              return [true, false]
            } else {
              return [true, true]
            }
          })
          availabilityValidation.forEach((returnValue: boolean) => {
            isTimeStringSpy.mockReturnValueOnce(returnValue)
          })

          const result = await sut.controller.saveWorkPreferences(httpRequest)

          expect(result).toEqual(
            new HttpJsonErrorResponse(
              'Invalid body property "availability"',
              `param availability[${availabilityIdx}].endsAt is malformed`,
              undefined,
              HttpErrorCode.validationError
            )
          )
        })
      })

      describe('isAfter()', () => {
        it('should call isAfter() with correct params', async () => {
          const isAfterSpy = jest.spyOn(sut.datetimeValidationService, 'isAfter')
          const { availability } = httpRequest.body
          const providedAvailability = availability.filter((item: any[]) => {
            return item && Object.keys(item).length > 0
          })

          await sut.controller.saveWorkPreferences(httpRequest)

          expect(isAfterSpy).toHaveBeenCalledTimes(providedAvailability.length + 1)
          const helperDate = new Date().toLocaleDateString()
          providedAvailability.forEach((item: any) => {
            const startsAtDatetime = new Date(`${helperDate} ${item.startsAt}`)
            const endsAtDatetime = new Date(`${helperDate} ${item.endsAt}`)
            expect(isAfterSpy).toHaveBeenCalledWith(endsAtDatetime, startsAtDatetime)
          })
        })

        it('should return HttpJsonErrorResponse, in the first time isAfter() returns false', async () => {
          const isAfterSpy = jest.spyOn(sut.datetimeValidationService, 'isAfter')
          const { availability } = httpRequest.body
          let availabilityIdx = -1
          const availabilityValidation = availability.map((_: any, idx: number) => {
            if (
              (_ && Object.keys(_).length > 0) &&
              availabilityIdx === -1
            ) {
              availabilityIdx = idx
              return false
            } else {
              return true
            }
          })
          availabilityValidation.forEach((returnValue: boolean) => {
            isAfterSpy.mockReturnValueOnce(returnValue)
          })

          const result = await sut.controller.saveWorkPreferences(httpRequest)

          expect(result).toEqual(
            new HttpJsonErrorResponse(
              'Invalid body property "availability"',
              `param availability[${availabilityIdx}].startsAt should be less than availability[${availabilityIdx}].endsAt`,
              undefined,
              HttpErrorCode.validationError
            )
          )
        })
      })
    })

    describe('property "jobPositionTypes"', () => {
      it('should return HttpJsonErrorResponse, if "jobPositionTypes" not exists', async () => {
        const invalidJobPositionType = Faker.random.word()
        httpRequest.body.jobPositionTypes = [
          ...httpRequest.body.jobPositionTypes,
          invalidJobPositionType
        ]
        const lastJobPositionTypeIdx = httpRequest.body.jobPositionTypes.length - 1

        const result = await sut.controller.saveWorkPreferences(httpRequest)

        expect(result).toEqual(
          new HttpJsonErrorResponse(
            'Invalid body property "jobPositionTypes"',
            `value of jobPositionTypes[${lastJobPositionTypeIdx}] not found`,
            undefined,
            HttpErrorCode.validationError
          )
        )
      })

      it('should return HttpJsonErrorResponse, if "jobPositionTypes" is duplicated', async () => {
        httpRequest.body.jobPositionTypes = [
          ...httpRequest.body.jobPositionTypes,
          httpRequest.body.jobPositionTypes[0]
        ]
        const lastJobPositionTypeIdx = httpRequest.body.jobPositionTypes.length - 1

        const result = await sut.controller.saveWorkPreferences(httpRequest)

        expect(result).toEqual(
          new HttpJsonErrorResponse(
            'Invalid body property "jobPositionTypes"',
            `value of jobPositionTypes[${lastJobPositionTypeIdx}] is duplicated`,
            undefined,
            HttpErrorCode.validationError
          )
        )
      })
    })

    describe('property "workingRadius"', () => {
      it('should return HttpJsonErrorResponse, if workingRadius[1] is less than workingRadius[0]', async () => {
        httpRequest.body.workingRadius = [1, 0]

        const result = await sut.controller.saveWorkPreferences(httpRequest)

        expect(result).toEqual(
          new HttpJsonErrorResponse(
            'Invalid body property "workingRadius"',
            'value of workingRadius[0] should be greater than workingRadius[1]',
            undefined,
            HttpErrorCode.validationError
          )
        )
      })
    })

    describe('property "willingToStartAt"', () => {
      let beforeNow: Date

      beforeEach(() => {
        beforeNow = Faker.date.past()
        Mockdate.set(new Date())
      })

      afterEach(() => {
        Mockdate.reset()
      })

      it('should call update "willingToStartAt" if its value is less than now', async () => {
        const saveWorkPreferencesSpy = jest.spyOn(sut.profilesRepository, 'saveWorkPreferences')
        httpRequest.body.willingToStartAt = beforeNow
        const now = new Date()

        await sut.controller.saveWorkPreferences(httpRequest)

        expect(saveWorkPreferencesSpy).toHaveBeenCalledTimes(1)
        expect(saveWorkPreferencesSpy).toHaveBeenCalledWith(
          httpRequest.user.uid,
          {
            ...httpRequest.body,
            willingToStartAt: now
          }
        )
      })
    })

    describe('Profiles Repository', () => {
      describe('saveWorkPreferences()', () => {
        it('should call saveWorkPreferences() with correct params', async () => {
          const saveWorkPreferencesSpy = jest.spyOn(sut.profilesRepository, 'saveWorkPreferences')

          await sut.controller.saveWorkPreferences(httpRequest)

          expect(saveWorkPreferencesSpy).toHaveBeenCalledTimes(1)
          expect(saveWorkPreferencesSpy).toHaveBeenCalledWith(
            httpRequest.user.uid,
            httpRequest.body
          )
        })
      })
    })

    it('should return HttpJsonResponse, on success', async () => {
      const result = await sut.controller.saveWorkPreferences(httpRequest)

      expect(result).toEqual(
        new HttpJsonResponse(sut.profilesRepository.userWorkPreferencesDTO)
      )
    })
  })
})
