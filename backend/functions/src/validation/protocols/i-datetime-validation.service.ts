export interface IDatetimeValidationService {
  isAfter(date: number | Date, dateToCompare: number | Date): boolean
  isTimeString(time: string): boolean
}