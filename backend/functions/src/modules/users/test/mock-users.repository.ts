import Faker from 'faker'
import {
  SaveArgyleUserDTO,
  UserDTO
} from 'deliverful-types/users/dtos'
import { IUsersRepository } from '../protocols/i-users.repository'

export class UsersRepositorySpy implements IUsersRepository {
  userDTO = mockUserDTO()

  async saveArgyleUser(uid: string, dto: SaveArgyleUserDTO): Promise<UserDTO> {
    return this.userDTO
  }

  async getUser(uid: string): Promise<UserDTO> {
    return this.userDTO
  }
}

export const mockUserDTO = (): UserDTO => ({
  uid: Faker.random.alphaNumeric(18),
  argyle: {
    userId: Faker.random.uuid(),
    userToken: Faker.random.alphaNumeric(36)
  },
  createdAt: Faker.date.past(),
  updatedAt: Faker.date.recent()
})