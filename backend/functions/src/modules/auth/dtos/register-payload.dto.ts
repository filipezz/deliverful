type RegisterPayloadDTO = {
  email: string
  password: string
  profile?: {
    name: string
    email: string
    phone: string
    picture: string
  }
}