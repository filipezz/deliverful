import { HttpJsonResponse } from './http.helpers'
import { NextFunction, Request, Response } from 'express'

export type ControllerHandler = (request: Request) => Promise<HttpJsonResponse>;

export function routeAdapter(controllerHandler: ControllerHandler) {
  return async (request: Request, response: Response) => {
    const httpJsonRes = await controllerHandler(request)
    response.status(httpJsonRes.httpStatus).json(httpJsonRes.data)
  }
}

export function middlewareAdapter(controllerHandler: ControllerHandler) {
  return async (request: Request, response: Response, next: NextFunction) => {
    const httpJsonRes = await controllerHandler(request)
    if (httpJsonRes.httpStatus < 400) {
      if (httpJsonRes.data) Object.assign(request, httpJsonRes.data)
      next()
    } else {
      response.status(httpJsonRes.httpStatus).json(httpJsonRes.data)
    }
  }
}