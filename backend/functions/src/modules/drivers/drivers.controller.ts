import { Request } from 'express'
import { HttpJsonResponse } from '../../helpers/http.helpers'
import { IDriversRepository } from './protocols/i-drivers.repository'

export class DriversController {
  constructor(private readonly driversRepo: IDriversRepository) {}

  async saveDriver(request: Partial<Request>): Promise<HttpJsonResponse> {
    const result = await this.driversRepo.saveDriver(request.user.uid, request.body)
    return new HttpJsonResponse(result)
  }
}