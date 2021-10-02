import { Request } from 'express'
import {
  HttpCode,
  HttpErrorCode,
  HttpInternalServerError,
  HttpJsonErrorResponse,
  HttpJsonResponse
} from '../../helpers/http.helpers'
import { IArgyleService } from '../../services/argyle/protocols/i-argyle.service'
import { IProfilesRepository } from '../profiles/protocols/i-profiles.repository'
import { SaveUserProfileDTO } from 'deliverful-types/profiles/dtos/save-user-profile.dto'
import { IUsersRepository } from './protocols/i-users.repository'
import { UserDTO } from 'deliverful-types/users/dtos'
import { IDriversRepository } from '../drivers/protocols/i-drivers.repository'
import { SaveUserDriverDTO } from 'deliverful-types/drivers/dtos'
import { argyleUserDocumentTypes } from '../../services/argyle/constants/argyle-user-document-types'

export class UsersController {
  constructor(
    private readonly usersRepo: IUsersRepository,
    private readonly profilesRepo: IProfilesRepository,
    private readonly argyleService: IArgyleService,
    private readonly driversRepo: IDriversRepository
  ) {}

  async saveArgyleUser(request: Partial<Request>): Promise<HttpJsonResponse> {
    const result = await this.usersRepo.saveArgyleUser(request.user.uid, request.body)
    return new HttpJsonResponse(result)
  }

  async saveArgyleUserAccount(request: Partial<Request>): Promise<HttpJsonResponse> {
    try {
      const userDTO = await this.usersRepo.getUser(request.user.uid)
      if (!userDTO.argyle) {
        return new HttpJsonErrorResponse(
          'Action forbidden',
          'User argyle not found for current user',
          undefined,
          HttpErrorCode.forbiddenError
        )
      }
      await Promise.all([
        this._saveUserProfile(userDTO, request),
        this._saveUserDriver(userDTO, request)
      ])

      return new HttpJsonResponse(undefined, HttpCode.noContent)
    } catch (error) {
      return new HttpInternalServerError(error)
    }
  }

  async getUser(request: Partial<Request>): Promise<HttpJsonResponse> {
    const result = await this.usersRepo.getUser(request.user.uid)
    return new HttpJsonResponse(result)
  }

  async refreshArgyleUserToken(request: Partial<Request>): Promise<HttpJsonResponse> {
    const userDTO = await this.usersRepo.getUser(request.user.uid)
    if (!userDTO.argyle) {
      return new HttpJsonErrorResponse(
        'Action forbidden',
        'User argyle not found for current user',
        undefined,
        HttpErrorCode.forbiddenError
      )
    }

    try {
      const userTokenPayload = await this.argyleService.createUserToken(
        userDTO.argyle.userId
      )

      const saveArgyleUserDTO = {
        userId: userDTO.argyle.userId,
        userToken: userTokenPayload.access
      }
      const savedUserDTO = await this.usersRepo.saveArgyleUser(
        userDTO.uid,
        saveArgyleUserDTO
      )

      return new HttpJsonResponse(savedUserDTO)
    } catch (error) {
      return new HttpInternalServerError(error)
    }
  }

  async _saveUserProfile(userDTO: UserDTO, request: Partial<Request>): Promise<void> {
    const argyleUserProfileDTO = await this.argyleService.loadUserProfile(
      userDTO.argyle?.userId as string, request.body.accountId
    )
    if (!argyleUserProfileDTO) {
      return
    }

    const userProfileDTO = await this.profilesRepo.getProfile(request.user.uid)
    const saveUserProfileDTO: SaveUserProfileDTO = {
      email: userProfileDTO?.email ?? argyleUserProfileDTO.email,
      name: userProfileDTO?.name ?? argyleUserProfileDTO.fullName,
      phone: userProfileDTO?.phone ?? argyleUserProfileDTO.phoneNumber,
      picture: argyleUserProfileDTO.pictureUrl,
      address: {
        line1: userProfileDTO?.address?.line1 ?? argyleUserProfileDTO.address?.line1,
        line2: userProfileDTO?.address?.line2 ?? argyleUserProfileDTO.address?.line2,
        city: userProfileDTO?.address?.city ?? argyleUserProfileDTO.address?.city,
        country: userProfileDTO?.address?.country ?? argyleUserProfileDTO.address?.country,
        postalCode: userProfileDTO?.address?.postalCode ?? argyleUserProfileDTO.address?.postalCode,
        state: userProfileDTO?.address?.state ?? argyleUserProfileDTO.address?.state
      }
    }
    await this.profilesRepo.saveProfile(
      request.user.uid,
      saveUserProfileDTO,
      false
    )
  }

  async _saveUserDriver(userDTO: UserDTO, request: Partial<Request>): Promise<void> {
    const argyleUserDocumentDTO = await this.argyleService.loadUserDocumentForType(
      { userId: userDTO.argyle?.userId as string, accountId: request.body.accountId },
      argyleUserDocumentTypes['drivers-licence']
    )
    if (!argyleUserDocumentDTO) {
      return
    }

    const userDriverDTO = await this.driversRepo.getDriver(request.user.uid)
    const saveUserDriverDTO: SaveUserDriverDTO = {
      license: {
        number: userDriverDTO?.license?.number ?? argyleUserDocumentDTO?.number,
        issuedDate: userDriverDTO?.license?.issuedDate ?? argyleUserDocumentDTO?.issuedDate,
        expirationDate: userDriverDTO?.license?.expirationDate ?? argyleUserDocumentDTO?.expirationDate,
        frontFileUrl: userDriverDTO?.license?.frontFileUrl ?? argyleUserDocumentDTO?.fileUrl
      }
    }
    await this.driversRepo.saveDriver(request.user.uid, saveUserDriverDTO)
  }
}
