import {
  GigExperienceDTO,
  UserTokenPayload,
  ArgyleUserProfileDTO,
  ArgyleUserDocumentDTO,
  ArgyleUserDocumentType
} from 'deliverful-types/argyle/dtos'

export type ListUserItemsArgs = {
  user: string
  account?: string
  limit?: number
  offset?: number
}

export type ArgyleUserItemsResponse<T> = {
  count: number
  results: T[]
}

export type LoadUserItemDTO = {
  userId: string
  accountId: string
}

export interface IArgyleService {
  createUserToken(userId: string): Promise<UserTokenPayload>
  loadUserProfile(userId: string, accountId: string): Promise<ArgyleUserProfileDTO | null>
  loadUserDocumentForType(dto: LoadUserItemDTO, type: ArgyleUserDocumentType): Promise<ArgyleUserDocumentDTO | null>
  listGigExperiences(userId: string): Promise<GigExperienceDTO[]>
}