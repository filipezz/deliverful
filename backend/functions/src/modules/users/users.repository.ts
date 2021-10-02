import {
  SaveArgyleUserDTO,
  UserDTO
} from 'deliverful-types/users/dtos'
import { IUsersRepository } from './protocols/i-users.repository'
import * as namespace from '../../middlewares/namespaces'
import { CollectionName } from 'deliverful-types/database'

export class UsersRepository implements IUsersRepository {
  private readonly usersRef: CollectionName

  constructor(private readonly db: FirebaseFirestore.Firestore) {
    this.usersRef = 'users'
  }

  async saveArgyleUser(uid: string, dto: SaveArgyleUserDTO): Promise<UserDTO> {
    const currentUserData = await this.getUser(uid)
    const now = new Date()
    const data = {
      id: currentUserData.uid,
      argyle: {
        userId: dto.userId,
        userToken: dto.userToken
      },
      createdAt: currentUserData.createdAt ?? now,
      updatedAt: now
    }

    await namespace.createOrUpdate(this.db, '', this.usersRef, data)
    return this.getUser(uid)
  }

  async getUser(uid: string): Promise<UserDTO> {
    const userData = await namespace.tryGet<UserDTO>(this.db, '', this.usersRef, uid)
    return {
      ...userData,
      uid,
      argyle: userData?.argyle ?? null
    } as UserDTO
  }
}