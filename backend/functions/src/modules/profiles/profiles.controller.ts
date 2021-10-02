import { Request } from 'express'
import {
  HttpErrorCode,
  HttpInternalServerError,
  HttpJsonErrorResponse,
  HttpJsonResponse
} from '../../helpers/http.helpers'
import { GigExperienceDTO } from 'deliverful-types/argyle/dtos'
import { IArgyleService } from '../../services/argyle/protocols/i-argyle.service'
import { UserArgyleInfo } from 'deliverful-types/users/dtos'
import { IUsersRepository } from '../users/protocols/i-users.repository'
import { IProfilesRepository } from './protocols/i-profiles.repository'
import { SaveWorkPreferencesDTO } from 'deliverful-types/profiles/dtos'
import { IDatetimeValidationService } from '../../validation/protocols/i-datetime-validation.service'
import { jobPositionType } from './constants/job-position-types'
import { IDriversRepository } from '../drivers/protocols/i-drivers.repository'

export class ProfilesController {
  constructor(
    private readonly profilesRepo: IProfilesRepository,
    private readonly usersRepo: IUsersRepository,
    private readonly argyleService: IArgyleService,
    private readonly datetimeValidationService: IDatetimeValidationService,
    private readonly driversRepo: IDriversRepository
  ) {}

  async saveProfile(request: Partial<Request>): Promise<HttpJsonResponse> {
    const result = await this.profilesRepo.saveProfile(request.user.uid, request.body)
    return new HttpJsonResponse(result)
  }

  async getProfile(request: Partial<Request>): Promise<HttpJsonResponse> {
    const userDTO = await this.usersRepo.getUser(request.user.uid)

    try {
      const [
        userProfileDTO,
        userWorkPreferencesDTO,
        userDriverDTO,
        gigExperiences
      ] = await Promise.all([
        this.profilesRepo.getProfile(userDTO.uid),
        this.profilesRepo.getWorkPreferences(userDTO.uid),
        this.driversRepo.getDriver(userDTO.uid),
        this._listGigExperiences(userDTO.argyle)
      ])
      return new HttpJsonResponse({
        info: userProfileDTO,
        gigs: gigExperiences,
        workPreferences: userWorkPreferencesDTO,
        driver: userDriverDTO
      })
    } catch (error) {
      return new HttpInternalServerError(error)
    }
  }

  async saveWorkPreferences(request: Partial<Request>): Promise<HttpJsonResponse> {
    const {
      availability = [],
      jobPositionTypes = [],
      workingRadius = []
    }: Required<SaveWorkPreferencesDTO> = request.body

    /** START - Validating Availability - START */
    for (const idx in availability) {
      const workAvailability = availability[idx]
      if (!workAvailability) {
        continue
      }
      const { startsAt, endsAt } = workAvailability
      if (!startsAt || !endsAt) {
        continue
      }

      const startsAtIsValid = this.datetimeValidationService.isTimeString(startsAt)
      if (!startsAtIsValid) {
        return new HttpJsonErrorResponse(
          'Invalid body property "availability"',
          `param availability[${idx}].startsAt is malformed`,
          undefined,
          HttpErrorCode.validationError
        )
      }
      const endsAtIsValid = this.datetimeValidationService.isTimeString(endsAt)
      if (!endsAtIsValid) {
        return new HttpJsonErrorResponse(
          'Invalid body property "availability"',
          `param availability[${idx}].endsAt is malformed`,
          undefined,
          HttpErrorCode.validationError
        )
      }

      const helperDate = new Date().toLocaleDateString()
      const startsAtDatetime = new Date(`${helperDate} ${startsAt}`)
      const endsAtDatetime = new Date(`${helperDate} ${endsAt}`)
      const endsAtIsAfterStartsAt =
        this.datetimeValidationService.isAfter(endsAtDatetime, startsAtDatetime)
      if (!endsAtIsAfterStartsAt) {
        return new HttpJsonErrorResponse(
          'Invalid body property "availability"',
          `param availability[${idx}].startsAt should be less than availability[${idx}].endsAt`,
          undefined,
          HttpErrorCode.validationError
        )
      }
    }
    /** END - Validating Availability - END */

    const jobPositionTypesDict: Record<string, number> = {}
    for (const idx in jobPositionTypes) {
      const item = jobPositionTypes[idx]
      if (!jobPositionType[item]) {
        return new HttpJsonErrorResponse(
          'Invalid body property "jobPositionTypes"',
          `value of jobPositionTypes[${idx}] not found`,
          undefined,
          HttpErrorCode.validationError
        )
      }

      if (jobPositionTypesDict[item]) {
        jobPositionTypesDict[item]++
        if (jobPositionTypesDict[item] > 1) {
          return new HttpJsonErrorResponse(
            'Invalid body property "jobPositionTypes"',
            `value of jobPositionTypes[${idx}] is duplicated`,
            undefined,
            HttpErrorCode.validationError
          )
        }
      } else {
        jobPositionTypesDict[item] = 1
      }
    }

    const [minMiles, maxMiles] = workingRadius
    if (minMiles > maxMiles) {
      return new HttpJsonErrorResponse(
        'Invalid body property "workingRadius"',
        'value of workingRadius[0] should be greater than workingRadius[1]',
        undefined,
        HttpErrorCode.validationError
      )
    }

    const now = new Date()
    const nowIsAfterWillingToStartAt = this.datetimeValidationService.isAfter(
      now,
      new Date(request.body.willingToStartAt)
    )
    if (nowIsAfterWillingToStartAt) {
      request.body.willingToStartAt = now
    }

    const workPreferencesDTO = await this.profilesRepo.saveWorkPreferences(
      request.user.uid,
      request.body
    )

    return new HttpJsonResponse(workPreferencesDTO)
  }

  private async _listGigExperiences(argyleUser: UserArgyleInfo): Promise<GigExperienceDTO[]> {
    let gigExperiences: GigExperienceDTO[] = []
    if (argyleUser) {
      gigExperiences = await this.argyleService.listGigExperiences(argyleUser.userId)
    }
    return gigExperiences
  }

  async saveQuestionnaire(request: Partial<Request>): Promise<HttpJsonResponse> {
    const questionnaire = request.body
    const saveQuestionnaire = await this.profilesRepo.saveQuestionnaire(request.user.uid, questionnaire)
    return new HttpJsonResponse(saveQuestionnaire)
  }
  
}