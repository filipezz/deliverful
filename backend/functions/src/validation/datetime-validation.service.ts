import isAfter from 'date-fns/isAfter'
import { IDatetimeValidationService } from './protocols/i-datetime-validation.service'

const _TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?(\s[a|p]m)?$/i

export class DatetimeValidationService implements IDatetimeValidationService {
  isAfter(date: number | Date, dateToCompare: number | Date): boolean {
    return isAfter(date, dateToCompare)
  }
  isTimeString(time: string): boolean {
    return _TIME_REGEX.test(time)
  }
}