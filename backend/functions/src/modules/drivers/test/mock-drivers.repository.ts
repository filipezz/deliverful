import { SaveUserDriverDTO, UserDriverDTO } from 'deliverful-types/drivers/dtos'
import Faker from 'faker'
import { IDriversRepository } from '../protocols/i-drivers.repository'

export class DriversRepositorySpy implements IDriversRepository {
  userDriverDTO = mockUserDriverDTO()

  async saveDriver(uid: string, dto: SaveUserDriverDTO): Promise<UserDriverDTO> {
    return this.userDriverDTO
  }
  async getDriver(uid: string): Promise<UserDriverDTO | null> {
    return this.userDriverDTO
  }
}

export const mockUserDriverDTO = (): UserDriverDTO => ({
  uid: Faker.random.uuid(),
  license: {
    number: Faker.random.alphaNumeric(11),
    issuedDate: Faker.date.past(),
    expirationDate: Faker.date.recent(),
    backFileUrl: Faker.image.image(),
    frontFileUrl: Faker.image.image()
  },
  createdAt: Faker.date.recent(),
  updatedAt: Faker.date.recent()
})