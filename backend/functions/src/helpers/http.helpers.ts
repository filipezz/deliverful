export enum HttpCode {
  ok = 200,
  noContent = 204,
}

export enum HttpErrorCode {
  badRequestError = 400,
  unauthorizedError = 401,
  forbiddenError = 403,
  notFoundError = 404,
  conflictError = 409,
  validationError = 422,
  internalServerError = 500,
}

export class HttpJsonResponse {
  data: Object;
  httpStatus: HttpCode | HttpErrorCode;

  constructor(
    data: Object = {},
    httpStatus: HttpCode | HttpErrorCode = HttpCode.ok
  ) {
    this.data = data
    this.httpStatus = httpStatus
  }
}

export class HttpJsonErrorResponse extends HttpJsonResponse {
  constructor(
    title: string,
    message: string,
    error?: string | object,
    httpStatus: HttpErrorCode = HttpErrorCode.internalServerError
  ) {
    const data = { title, message, error }
    super(data, httpStatus)
  }
}

export class HttpInternalServerError extends HttpJsonErrorResponse {
  constructor(error: string | object) {
    super(
      'Internal server error',
      'Something unexpected happened. Please, try again.',
      error,
      HttpErrorCode.internalServerError
    )
  }
}