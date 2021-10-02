import { adminApp } from '../../config/firebase-admin'
import { ArgyleService } from '../../services/argyle/argyle.service'
import { makeDriversRepository } from '../drivers/drivers.factory'
import { makeProfilesRepository } from '../profiles/profiles.factory'
import { IUsersRepository } from './protocols/i-users.repository'
import { UsersController } from './users.controller'
import { UsersRepository } from './users.repository'

export function makeUsersRepository(): IUsersRepository {
  return new UsersRepository(adminApp.firestore())
}

export function makeUsersController(): UsersController {
  return new UsersController(
    makeUsersRepository(),
    makeProfilesRepository(),
    ArgyleService.getInstance(),
    makeDriversRepository()
  )
}