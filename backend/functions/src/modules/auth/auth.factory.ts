import { getFirApp } from '../../config/firebase'
import { adminApp } from '../../config/firebase-admin'
import { makeProfilesRepository } from '../profiles/profiles.factory'
import { AuthController } from './auth.controller'
import { AuthRepository } from './auth.repository'
import { CheckAuthMiddleware } from './middlewares/check-auth.middleware'
import { IAuthRepository } from './protocols/i-auth-repository'

export function makeAuthRepository(): IAuthRepository {
  return new AuthRepository(getFirApp(), adminApp)
}

export function makeAuthController(): AuthController {
  return new AuthController(makeAuthRepository(), makeProfilesRepository())
}

export function makeCheckAuthMiddleware(): CheckAuthMiddleware {
  return new CheckAuthMiddleware(adminApp)
}