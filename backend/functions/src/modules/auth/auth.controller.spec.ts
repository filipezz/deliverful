import Faker from 'faker'
import {
  HttpErrorCode,
  HttpInternalServerError,
  HttpJsonErrorResponse,
  HttpJsonResponse
} from '../../helpers/http.helpers'
import { AuthController } from './auth.controller'
import { AuthRepositorySpy } from './test/mock-auth.repository'
import { Request } from 'express'
import { ProfilesRepositorySpy } from '../profiles/test/mock-profiles.repository'
import { mockSaveUserProfileDTO } from '../profiles/dtos/test/mock-save-user-profile.dto'

type ISutTypes = {
  authRepository: AuthRepositorySpy;
  profilesRepository: ProfilesRepositorySpy;
  controller: AuthController;
};

/** SUT - System under test */
function makeSut(): ISutTypes {
  const authRepository = new AuthRepositorySpy()
  const profilesRepository = new ProfilesRepositorySpy()
  const controller = new AuthController(authRepository, profilesRepository)

  return {
    authRepository,
    profilesRepository,
    controller
  }
}

describe('Auth Controller', () => {
  let sut: ISutTypes

  beforeEach(() => {
    sut = makeSut()
  })

  describe('signIn()', () => {
    let mockedRequest: Partial<Request>

    beforeEach(() => {
      mockedRequest = {
        body: {
          email: Faker.internet.email(),
          password: Faker.internet.password()
        }
      }
    })

    describe('Auth Repository', () => {
      it('should call signInWithEmailAndPassword() with correct params', async () => {
        const signInWithEmailAndPasswordSpy = jest.spyOn(
          sut.authRepository,
          'signInWithEmailAndPassword'
        )

        await sut.controller.signInWithEmailAndPassword(mockedRequest)

        expect(signInWithEmailAndPasswordSpy).toHaveBeenCalledTimes(1)
        expect(signInWithEmailAndPasswordSpy).toHaveBeenCalledWith(
          mockedRequest.body
        )
      })

      it('should return HttpJsonErrorResponse if signInWithEmailAndPassword() throws \'auth/wrong-password\'', async () => {
        const error = { code: 'auth/wrong-password' }
        jest
          .spyOn(sut.authRepository, 'signInWithEmailAndPassword')
          .mockRejectedValueOnce(error)

        const result = await sut.controller.signInWithEmailAndPassword(mockedRequest)

        expect(result).toEqual(
          new HttpJsonErrorResponse(
            'Sign in failed',
            'Wrong password.',
            error,
            HttpErrorCode.unauthorizedError
          )
        )
      })

      it('should return HttpJsonErrorResponse if signInWithEmailAndPassword() throws \'auth/user-not-found\'', async () => {
        const error = { code: 'auth/user-not-found' }
        jest
          .spyOn(sut.authRepository, 'signInWithEmailAndPassword')
          .mockRejectedValueOnce(error)

        const result = await sut.controller.signInWithEmailAndPassword(mockedRequest)

        expect(result).toEqual(
          new HttpJsonErrorResponse(
            'Sign in failed',
            'Wrong identifier.',
            error,
            HttpErrorCode.unauthorizedError
          )
        )
      })

      it('should return HttpInternalServerError if signInWithEmailAndPassword() throws unknown', async () => {
        jest
          .spyOn(sut.authRepository, 'signInWithEmailAndPassword')
          .mockRejectedValueOnce('')

        const result = await sut.controller.signInWithEmailAndPassword(mockedRequest)

        expect(result).toEqual(new HttpInternalServerError(''))
      })
    })

    it('should return HttpJsonResponse instance with correct data', async () => {
      const result = await sut.controller.signInWithEmailAndPassword(mockedRequest)

      expect(result).toEqual(
        new HttpJsonResponse(sut.authRepository.authPayloadDTO)
      )
    })
  })

  describe('register()', () => {
    let mockedRequest: Partial<Request>

    beforeEach(() => {
      mockedRequest = {
        body: {
          email: Faker.internet.email(),
          password: Faker.internet.password(),
          profile: mockSaveUserProfileDTO()
        }
      }
    })

    describe('Auth Repository', () => {
      it('should call register() with correct params', async () => {
        const registerSpy = jest.spyOn(
          sut.authRepository,
          'register'
        )

        await sut.controller.register(mockedRequest)

        expect(registerSpy).toHaveBeenCalledTimes(1)
        expect(registerSpy).toHaveBeenCalledWith({
          email: mockedRequest.body.email,
          password: mockedRequest.body.password
        })
      })

      it('should return HttpJsonErrorResponse if register() throws \'auth/email-already-in-use\'', async () => {
        const error = { code: 'auth/email-already-in-use' }
        jest
          .spyOn(sut.authRepository, 'register')
          .mockRejectedValueOnce(error)

        const result = await sut.controller.register(mockedRequest)

        expect(result).toEqual(
          new HttpJsonErrorResponse(
            'Register failed',
            'E-mail already in use.',
            error,
            HttpErrorCode.conflictError
          )
        )
      })

      it('should return HttpJsonErrorResponse if register() throws \'auth/weak-password\'', async () => {
        const error = { code: 'auth/weak-password' }
        jest
          .spyOn(sut.authRepository, 'register')
          .mockRejectedValueOnce(error)

        const result = await sut.controller.register(mockedRequest)

        expect(result).toEqual(
          new HttpJsonErrorResponse(
            'Register failed',
            'The password is too weak.',
            error,
            HttpErrorCode.validationError
          )
        )
      })

      it('should return HttpInternalServerError if register() throws unknown', async () => {
        jest
          .spyOn(sut.authRepository, 'register')
          .mockRejectedValueOnce('')

        const result = await sut.controller.register(mockedRequest)

        expect(result).toEqual(new HttpInternalServerError(''))
      })
    })

    describe('Profiles Repository', () => {
      it('should call saveProfile() with correct params', async () => {
        const saveProfileSpy = jest.spyOn(
          sut.profilesRepository,
          'saveProfile'
        )

        await sut.controller.register(mockedRequest)

        expect(saveProfileSpy).toHaveBeenCalledTimes(1)
        expect(saveProfileSpy).toHaveBeenCalledWith(
          sut.authRepository.authPayloadDTO.uid,
          mockedRequest.body.profile
        )
      })

      describe('when request.body.profile not provided', () => {
        beforeEach(() => {
          mockedRequest.body.profile = undefined
        })

        it('should call saveProfile() with correct params', async () => {
          const saveProfileSpy = jest.spyOn(
            sut.profilesRepository,
            'saveProfile'
          )

          await sut.controller.register(mockedRequest)

          expect(saveProfileSpy).toHaveBeenCalledTimes(1)
          expect(saveProfileSpy).toHaveBeenCalledWith(
            sut.authRepository.authPayloadDTO.uid,
            { email: mockedRequest.body.email }
          )
        })
      })

      it('should return HttpInternalServerError if saveProfile() throws unknown', async () => {
        jest
          .spyOn(sut.profilesRepository, 'saveProfile')
          .mockRejectedValueOnce('')

        const result = await sut.controller.register(mockedRequest)

        expect(result).toEqual(new HttpInternalServerError(''))
      })
    })

    it('should return HttpJsonResponse with correct params', async () => {
      const result = await sut.controller.register(mockedRequest)

      expect(result).toEqual(
        new HttpJsonResponse({
          user: sut.authRepository.authPayloadDTO,
          profile: sut.profilesRepository.userProfileDTO
        })
      )
    })
  })
})