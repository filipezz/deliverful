import { AuthPayloadDTO, RegisterPayloadDTO, LoginPayloadDTO } from 'deliverful-types/auth/dtos'
import { IAuthRepository } from '../protocols/i-auth-repository'
import { mockAuthPayloadDTO } from '../dtos/test/mock-auth-payload.dto'

export class AuthRepositorySpy implements IAuthRepository {
  authPayloadDTO = mockAuthPayloadDTO();

  async signInWithEmailAndPassword(dto: LoginPayloadDTO): Promise<AuthPayloadDTO> {
    return this.authPayloadDTO
  }

  async signOut(uid: string): Promise<any> {
    return
  }

  async register(dto: RegisterPayloadDTO): Promise<AuthPayloadDTO> {
    return this.authPayloadDTO
  }
}
