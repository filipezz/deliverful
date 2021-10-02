import firebase from 'firebase'
import { RegisterPayloadDTO, AuthPayloadDTO, LoginPayloadDTO } from 'deliverful-types/auth/dtos'
import { IAuthRepository } from './protocols/i-auth-repository'
import { HttpJsonErrorResponse } from '../../helpers/http.helpers'
import admin from 'firebase-admin'

export class AuthRepository implements IAuthRepository {
  constructor(
    private readonly firApp: firebase.app.App,
    private readonly adminApp: admin.app.App,
  ) {}

  async signInWithEmailAndPassword(loginPayload: LoginPayloadDTO): Promise<any> {
    return this.firApp
      .auth()
      .signInWithEmailAndPassword(loginPayload.email, loginPayload.password)
      .then(async (payload) => {
        const userUID = payload.user?.uid
        if (!userUID) {
          throw new HttpJsonErrorResponse('Bad request', 'No user provided')
        }
        //const profile = await this.getProfile(userUID);
        return { ...payload }
      })
  }

  async signOut(uid: string) {
    return this.adminApp.auth().revokeRefreshTokens(uid)
  }

  async register(dto: RegisterPayloadDTO): Promise<AuthPayloadDTO> {
    const userCredential = await this.firApp
      .auth()
      .createUserWithEmailAndPassword(dto.email, dto.password)
    const userData = userCredential.user?.toJSON() as any
    const { accessToken, refreshToken, expirationTime } = userData.stsTokenManager

    return {
      uid: userData.uid,
      token: {
        accessToken,
        refreshToken,
        expirationTime
      }
    }
  }

}