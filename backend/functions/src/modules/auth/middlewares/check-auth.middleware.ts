import { Request } from 'express'
import admin from 'firebase-admin'
import {
  HttpErrorCode,
  HttpInternalServerError,
  HttpJsonErrorResponse,
  HttpJsonResponse
} from '../../../helpers/http.helpers'

export class CheckAuthMiddleware {
  constructor(private readonly adminApp: admin.app.App) {}

  async handle(request: Partial<Request>) {
    if (!request.headers?.authorization) {
      return new HttpJsonErrorResponse(
        'Unauthorized',
        'Token not provided',
        undefined,
        HttpErrorCode.unauthorizedError
      )
    }

    try {
      const checkRevokedTokens = true
      const decodedToken = await this.adminApp
        .auth()
        .verifyIdToken(request.headers.authorization, checkRevokedTokens)

      const user = await this.adminApp.auth().getUser(decodedToken.uid)
      const response = { user }

      return new HttpJsonResponse(response)
    } catch (error) {
      const errorCode = error.code

      if (errorCode === 'auth/id-token-revoked') {
        return new HttpJsonErrorResponse(
          'Unauthorized',
          'Token revoked',
          error,
          HttpErrorCode.unauthorizedError
        )
      } else if (errorCode === 'auth/id-token-expired') {
        return new HttpJsonErrorResponse(
          'Unauthorized',
          'Token expired',
          error,
          HttpErrorCode.unauthorizedError
        )
      } else if (errorCode === 'auth/argument-error') {
        return new HttpJsonErrorResponse(
          'Bad request',
          'Token is invalid or malformed',
          error,
          HttpErrorCode.badRequestError
        )
      } else if (errorCode === 'auth/user-not-found') {
        return new HttpJsonErrorResponse(
          'Unauthorized',
          'User not logged in',
          error,
          HttpErrorCode.unauthorizedError
        )
      }
      return new HttpInternalServerError(error)
    }
  }
}