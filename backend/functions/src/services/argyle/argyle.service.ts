import { adminApp } from '../../config/firebase-admin'
import { HttpService } from '../http/http.service'
import {
  GigExperienceDTO,
  UserTokenPayload,
  ArgyleUserProfileDTO,
  RawArgyleUserProfileDTO,
  RawArgyleUserEmploymentDTO,
  RawArgyleUserReputationDTO,
  RawArgyleUserActivityDTO,
  ArgyleUserDocumentDTO,
  ArgyleUserDocumentType,
  RawArgyleUserDocumentDTO
} from 'deliverful-types/argyle/dtos'
import {
  ArgyleUserItemsResponse,
  IArgyleService,
  ListUserItemsArgs,
  LoadUserItemDTO
} from './protocols/i-argyle.service'

const BASE_URL = process.env['ARGYLE_API_URL']
const AUTH = {
  username: process.env['ARGYLE_CLIENT_ID'] as string,
  password: process.env['ARGYLE_CLIENT_SECRET'] as string
}

export class ArgyleService extends HttpService implements IArgyleService {
  private static instance: ArgyleService
  private argyleRef: FirebaseFirestore.CollectionReference | null

  private constructor(private db?: FirebaseFirestore.Firestore) {
    super({
      baseURL: BASE_URL,
      auth: AUTH
    })
    if (this.db) {
      this.argyleRef = this.db.collection('argyle')
    } else {
      this.argyleRef = null
    }
  }

  static getInstance(db?: FirebaseFirestore.Firestore): ArgyleService {
    if (!ArgyleService.instance) {
      ArgyleService.instance = db
        ? new ArgyleService(db)
        : new ArgyleService(adminApp.firestore())
    }
    if (db) {
      ArgyleService.instance.db = db
    }

    return ArgyleService.instance
  }

  async createUserToken(userId: string): Promise<UserTokenPayload> {
    const response = await this.client.post('/user-tokens', { user: userId })
    return response.data
  }

  async loadUserProfile(userId: string, accountId: string): Promise<ArgyleUserProfileDTO | null> {
    const { results: [profile] } = await this._listProfiles({
      user: userId, account: accountId
    })
    if (!profile) {
      return null
    }

    const argyleUserProfileDTO: ArgyleUserProfileDTO = {
      id: profile.id,
      account: profile.account,
      employer: profile.employer,
      fullName: profile.full_name,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      birthdate: profile.birth_date,
      gender: profile.gender,
      phoneNumber: profile.phone_number,
      pictureUrl: profile.picture_url,
      ssn: profile.ssn
    }
    if (profile.address) {
      argyleUserProfileDTO.address = {
        line1: profile.address.line1,
        line2: profile.address.line2,
        city: profile.address.city,
        state: profile.address.state,
        postalCode: profile.address.postal_code,
        country: profile.address.country
      }
    }

    return argyleUserProfileDTO
  }

  async loadUserDocumentForType(dto: LoadUserItemDTO, type: ArgyleUserDocumentType): Promise<ArgyleUserDocumentDTO | null> {
    const { results } = await this._listDocuments({ user: dto.userId, account: dto.accountId })
    const [rawArgyleUserDocumentForType] = results.filter(item => item.document_type === type)
    let argyleUserDocumentDTO: ArgyleUserDocumentDTO | null = null
    if (rawArgyleUserDocumentForType) {
      argyleUserDocumentDTO = {
        id: rawArgyleUserDocumentForType.id,
        account: rawArgyleUserDocumentForType.account,
        employer: rawArgyleUserDocumentForType.employer,
        expirationDate: rawArgyleUserDocumentForType.expiration_date,
        issuedDate: rawArgyleUserDocumentForType.created_at,
        number: rawArgyleUserDocumentForType.document_number,
        typeDescription: rawArgyleUserDocumentForType.document_type_description,
        type: rawArgyleUserDocumentForType.document_type,
        fileUrl: rawArgyleUserDocumentForType.file_url
      }
    }
    return argyleUserDocumentDTO
  }

  async listGigExperiences(userId: string): Promise<GigExperienceDTO[]> {
    const resourcesLimit = 10000
    const { results: employments } = await this._listEmployments({ user: userId, limit: resourcesLimit })

    // creating a dictionary from accountId
    // to the initial values of GigExperienceDTO
    const accountIdToGigExperience = employments.reduce<Record<string, Partial<GigExperienceDTO>>>(
      (acc, item) => ({
        ...acc,
        [item.account]: {
          id: item.id,
          employer: item.employer,
          hireDatetime: item.hire_datetime,
          terminationDatetime: item.termination_datetime
        }
      }),
      {}
    )

    // injecting into accountIdToGigExperience
    // values of Argyle's user repuration: "rating", "awards" (achievements)
    const { results: reputations } = await this._listReputations({
      user: userId, limit: resourcesLimit
    })
    reputations.forEach(reputationItem => {
      if (accountIdToGigExperience[reputationItem.account]) {
        accountIdToGigExperience[reputationItem.account].rating = reputationItem.rating
        if (reputationItem.achievements) {
          accountIdToGigExperience[reputationItem.account].awards =
            reputationItem.achievements.map(achievementItem => ({
              label: achievementItem.label,
              description: achievementItem.description,
              badgeUrl: achievementItem.badge_url
            }))
        } else {
          accountIdToGigExperience[reputationItem.account].awards = []
        }
      }
    })

    // injecting into accountIdToGigExperience
    // values of Argyle's user activities: "trips" (count, for each accountId)
    for (const item of employments) {
      const { count, results: [ activity ] } = await this._listActivities({
        user: userId, account: item.account, limit: resourcesLimit
      })
      accountIdToGigExperience[activity.account].trips = count
    }

    // transforming the dictionary of accountIdToGigExperience
    // to an array of GigExperienceDTO
    return Object.keys(accountIdToGigExperience).map(accountId => {
      return accountIdToGigExperience[accountId] as GigExperienceDTO
    })
  }

  async _listProfiles(args: ListUserItemsArgs): Promise<
    ArgyleUserItemsResponse<RawArgyleUserProfileDTO>
  > {
    return this._listUserItems<RawArgyleUserProfileDTO>('profiles', args)
  }

  async _listDocuments(args: ListUserItemsArgs): Promise<
    ArgyleUserItemsResponse<RawArgyleUserDocumentDTO>
  > {
    return this._listUserItems<RawArgyleUserDocumentDTO>('documents', args)
  }

  async _listEmployments(args: ListUserItemsArgs): Promise<
    ArgyleUserItemsResponse<RawArgyleUserEmploymentDTO>
  > {
    return this._listUserItems<RawArgyleUserEmploymentDTO>('employments', args)
  }

  async _listReputations(args: ListUserItemsArgs): Promise<
    ArgyleUserItemsResponse<RawArgyleUserReputationDTO>
  > {
    return this._listUserItems<RawArgyleUserReputationDTO>('reputations', args)
  }

  async _listActivities(args: ListUserItemsArgs): Promise<
    ArgyleUserItemsResponse<RawArgyleUserActivityDTO>
  > {
    return this._listUserItems<RawArgyleUserActivityDTO>('activities', args)
  }

  async _listUserItems<T, R = ArgyleUserItemsResponse<T>>(resourceName: string, args: ListUserItemsArgs): Promise<R> {
    let response: R = (<unknown>{ results: [], count: 0 }) as R

    const resourceRef = this.argyleRef?.doc(args.user).collection(resourceName).doc(args.account ?? args.user)
    const dbResponse = (await resourceRef?.get())
    if (dbResponse?.exists) {
      response = dbResponse.data() as R
    } else {
      const argyleResponse = await this.client.get(resourceName, { params: args })
      response = argyleResponse.data

      if (resourceRef) {
        await resourceRef?.set(response)
      }
    }

    return response
  }
}