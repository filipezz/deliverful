import Faker from 'faker'
import { DatetimeValidationService } from './datetime-validation.service'
import isAfter from 'date-fns/isAfter'

jest.mock('date-fns/isAfter', () => jest.fn().mockReturnValue(true))

type SutTypes = {
  service: DatetimeValidationService
}

function makeSut(): SutTypes {
  const service = new DatetimeValidationService()

  return { service }
}

describe('DatetimeValidation Service', () => {
  let service: DatetimeValidationService

  beforeEach(() => {
    const sut = makeSut()
    service = sut.service
  })

  describe('isAfter()', () => {
    let date: Date, dateToCompare: Date
    let isAfterSpy: jest.SpyInstance

    beforeEach(() => {
      date = Faker.date.recent()
      dateToCompare = Faker.date.recent()
      isAfterSpy = (<jest.SpyInstance>(<unknown>isAfter))
    })

    describe('DateFNS dependency', () => {
      it('should call isAfter() with correct params', () => {
        service.isAfter(date, dateToCompare)

        expect(isAfterSpy).toHaveBeenCalledTimes(1)
        expect(isAfterSpy).toHaveBeenCalledWith(date, dateToCompare)
      })

      it('should throw if isAfter() throws', () => {
        const error = new Error('[DateFNS] isAfter() Error')
        isAfterSpy.mockImplementationOnce(() => { throw error })

        try {
          service.isAfter(date, dateToCompare)
        } catch (err) {
          expect(err).toEqual(error)
        }
      })
    })

    it('should return false if isAfter() returns false', () => {
      isAfterSpy.mockReturnValueOnce(false)

      const result = service.isAfter(date, dateToCompare)

      expect(result).toBe(false)
    })

    it('should return true if isAfter() returns true', () => {
      const result = service.isAfter(date, dateToCompare)

      expect(result).toBe(true)
    })
  })

  describe('isTimeString()', () => {
    let time: string

    beforeEach(() => {
      time = Faker.date.recent().toLocaleTimeString()
    })

    it('should return false if "time" is invalid', () => {
      const result = [
        service.isTimeString('23:60'),
        service.isTimeString('24:59'),
        service.isTimeString('24:59:60'),
        service.isTimeString('23:59:599'),
        service.isTimeString('023:59'),
        service.isTimeString('23:059')
      ]

      expect(result).toEqual(result.map(() => false))
    })

    it('should return true if isAfter() returns true', () => {
      const result = service.isTimeString(time)

      expect(result).toBe(true)
    })
  })
})