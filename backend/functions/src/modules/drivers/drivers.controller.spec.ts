import { Request } from 'express'
import Faker from 'faker'
import { HttpJsonResponse } from '../../helpers/http.helpers'
import { DriversController } from './drivers.controller'
import { mockSaveUserDriverDTO } from './dtos/test/mock-save-user-driver.dto'
import { DriversRepositorySpy } from './test/mock-drivers.repository'

type ISutTypes = {
  controller: DriversController
  driversRepository: DriversRepositorySpy
}

function makeSut(): ISutTypes {
  const driversRepository = new DriversRepositorySpy()
  const controller = new DriversController(driversRepository)

  return {
    controller,
    driversRepository
  }
}

describe('Drivers Controller', () => {
  let sut: ISutTypes

  beforeEach(() => {
    sut = makeSut()
  })

  describe('saveDriver()', () => {
    let httpRequest: Partial<Request>

    beforeEach(() => {
      httpRequest = {
        user: {
          uid: Faker.random.uuid()
        },
        body: mockSaveUserDriverDTO()
      }
    })

    describe('Drivers Repository', () => {
      it('should call saveDriver() with correct params', async () => {
        const saveDriverSpy = jest.spyOn(sut.driversRepository, 'saveDriver')

        await sut.controller.saveDriver(httpRequest)

        expect(saveDriverSpy).toHaveBeenCalledTimes(1)
        expect(saveDriverSpy).toHaveBeenCalledWith(
          httpRequest.user.uid,
          httpRequest.body
        )
      })
    })

    it('should return HttpJsonResponse with correct data, on success', async () => {
      const result = await sut.controller.saveDriver(httpRequest)

      expect(result).toEqual(
        new HttpJsonResponse(sut.driversRepository.userDriverDTO)
      )
    })
  })
})