import { adminApp } from '../../config/firebase-admin'
import { ArgyleService } from '../../services/argyle/argyle.service'
import { DatetimeValidationService } from '../../validation/datetime-validation.service'
import { makeDriversRepository } from '../drivers/drivers.factory'
import { makeUsersRepository } from '../users/users.factory'
import { ProfilesController } from './profiles.controller'
import { ProfilesRepository } from './profiles.repository'
import { IProfilesRepository } from './protocols/i-profiles.repository'

export function makeProfilesRepository(): IProfilesRepository {
  return new ProfilesRepository(adminApp.firestore())
}

export function makeProfilesController(): ProfilesController {
  return new ProfilesController(
    makeProfilesRepository(),
    makeUsersRepository(),
    ArgyleService.getInstance(),
    new DatetimeValidationService(),
    makeDriversRepository()
  )
}