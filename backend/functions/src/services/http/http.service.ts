import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const DEFAULT_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

export class HttpService {
  readonly #client: AxiosInstance

  constructor(config?: AxiosRequestConfig) {
    this.#client = axios.create({
      ...config,
      timeout: 5000,
      headers: {
        ...DEFAULT_HEADERS,
        ...config?.headers
      }
    })
  }

  get client(): AxiosInstance {
    return this.#client
  }
}