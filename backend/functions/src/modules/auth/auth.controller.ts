import { Request } from 'express'
import {
  HttpCode,
  HttpErrorCode,
  HttpInternalServerError,
  HttpJsonErrorResponse,
  HttpJsonResponse
} from '../../helpers/http.helpers'
import { IProfilesRepository } from '../profiles/protocols/i-profiles.repository'
import { IAuthRepository } from './protocols/i-auth-repository'

export class AuthController {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly profilesRepo: IProfilesRepository
  ) {}

  async signInWithEmailAndPassword(request: Partial<Request>) {
    try {
      const userCredentials = await this.authRepo.signInWithEmailAndPassword(
        request.body
      )
      return new HttpJsonResponse(userCredentials)
    } catch (error) {
      const errorCode = error.code

      if (errorCode === 'auth/wrong-password') {
        return new HttpJsonErrorResponse(
          'Sign in failed',
          'Wrong password.',
          error,
          HttpErrorCode.unauthorizedError
        )
      } else if (errorCode === 'auth/user-not-found') {
        return new HttpJsonErrorResponse(
          'Sign in failed',
          'Wrong identifier.',
          error,
          HttpErrorCode.unauthorizedError
        )
      } else {
        return new HttpInternalServerError(error)
      }
    }
  }

  async signOut(request: Partial<Request>) {
    try {
      await this.authRepo.signOut(request.user.uid)
      return new HttpJsonResponse(undefined, HttpCode.noContent)
    } catch (error) {
      return new HttpInternalServerError(error)
    }
  }

  async register(request: Partial<Request>) {
    try {
      const { email, password } = request.body
      const authPayloadDTO = await this.authRepo.register({ email, password })

      let profileData = request.body.profile
      if (profileData) {
        profileData.email = email
      } else {
        profileData = { email }
      }
      const userProfileDTO = await this.profilesRepo.saveProfile(authPayloadDTO.uid, profileData)

      return new HttpJsonResponse({
        user: authPayloadDTO,
        profile: userProfileDTO
      })
    } catch (error) {
      const errorCode = error.code

      if (errorCode === 'auth/email-already-in-use') {
        return new HttpJsonErrorResponse(
          'Register failed',
          'E-mail already in use.',
          error,
          HttpErrorCode.conflictError
        )
      }

      if (errorCode === 'auth/weak-password') {
        return new HttpJsonErrorResponse(
          'Register failed',
          'The password is too weak.',
          error,
          HttpErrorCode.validationError
        )
      } else {
        return new HttpInternalServerError(error)
      }
    }
  }
}