import { CollectionName } from 'deliverful-types/database'
import {
  SaveUserDriverDTO,
  UserDriverDTO
} from 'deliverful-types/drivers/dtos'
import { IDriversRepository } from './protocols/i-drivers.repository'
import * as namespace from '../../middlewares/namespaces'

export class DriversRepository implements IDriversRepository {
  private readonly driversRef: CollectionName = 'drivers'

  constructor(private readonly db: FirebaseFirestore.Firestore) {}

  async saveDriver(uid: string, dto: SaveUserDriverDTO): Promise<UserDriverDTO> {
    let userDriverData: UserDriverDTO = (await this.getDriver(uid) || {}) as UserDriverDTO

    if (dto.license) {
      const now = new Date()
      const driverData = {
        id: uid,
        license: { ...userDriverData?.license, ...dto.license },
        createdAt: userDriverData.createdAt ?? now,
        updatedAt: now
      }
      await namespace.createOrUpdate(this.db, '', this.driversRef, driverData)
      userDriverData = await this.getDriver(uid) as UserDriverDTO
    }

    return userDriverData
  }

  async getDriver(uid: string): Promise<UserDriverDTO | null> {
    const userDriverData = await namespace.tryGet<UserDriverDTO>(this.db, '', this.driversRef, uid)
    if (!userDriverData) {
      return null
    }

    return { ...userDriverData, uid } as UserDriverDTO
  }
}