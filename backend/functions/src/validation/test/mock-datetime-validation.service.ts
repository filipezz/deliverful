import { IDatetimeValidationService } from '../protocols/i-datetime-validation.service'

export class DatetimeValidationServiceSpy implements IDatetimeValidationService {
  isAfter(date: number | Date, dateToCompare: number | Date): boolean {
    return true
  }
  isTimeString(time: string): boolean {
    return true
  }
}