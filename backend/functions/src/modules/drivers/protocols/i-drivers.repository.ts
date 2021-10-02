import { UserDriverDTO, SaveUserDriverDTO } from 'deliverful-types/drivers/dtos'

export interface IDriversRepository {
  saveDriver(uid: string, dto: SaveUserDriverDTO): Promise<UserDriverDTO>
  getDriver(uid: string): Promise<UserDriverDTO | null>
}