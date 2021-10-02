import {
  SaveArgyleUserDTO,
  UserDTO
} from 'deliverful-types/users/dtos'

export interface IUsersRepository {
  saveArgyleUser(uid: string, dto: SaveArgyleUserDTO): Promise<UserDTO>
  getUser(uid: string): Promise<UserDTO>
}
