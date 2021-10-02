import { AuthPayloadDTO, RegisterPayloadDTO, LoginPayloadDTO } from 'deliverful-types/auth/dtos'

export interface IAuthRepository {
  register(dto: RegisterPayloadDTO): Promise<AuthPayloadDTO>
  signInWithEmailAndPassword(dto: LoginPayloadDTO): Promise<AuthPayloadDTO>
  signOut(uid: string): Promise<any>;
}