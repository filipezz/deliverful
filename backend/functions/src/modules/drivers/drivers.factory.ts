import { adminApp } from '../../config/firebase-admin'
import { DriversController } from './drivers.controller'
import { DriversRepository } from './drivers.repository'
import { IDriversRepository } from './protocols/i-drivers.repository'

export function makeDriversRepository(): IDriversRepository {
  return new DriversRepository(adminApp.firestore())
}

export function makeDriversController(): DriversController {
  return new DriversController(makeDriversRepository())
}