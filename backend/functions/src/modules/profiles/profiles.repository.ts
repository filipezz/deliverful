import { CollectionName } from 'deliverful-types/database'
import {
  SaveUserProfileDTO,
  UserProfileDTO,
  SaveWorkPreferencesDTO,
  UserWorkPreferencesDTO
} from 'deliverful-types/profiles/dtos'
import { IProfilesRepository } from './protocols/i-profiles.repository'
import * as namespace from '../../middlewares/namespaces'

export class ProfilesRepository implements IProfilesRepository {
  private readonly profilesRef: CollectionName = 'profiles'
  private readonly workPreferencesRef: CollectionName = 'workPreferences'

  constructor(private readonly db: FirebaseFirestore.Firestore) {}

  async saveProfile(uid: string, dto: SaveUserProfileDTO, replacePicture = true): Promise<UserProfileDTO> {
    const userProfileData: Partial<UserProfileDTO> = await this.getProfile(uid) || {}

    const picturesGallery = [...(userProfileData.picturesGallery ?? [])]
    if (dto.picture) {
      if (picturesGallery.every(pictureItem => pictureItem !== dto.picture)) {
        picturesGallery.push(dto.picture)
        userProfileData.picturesGallery = picturesGallery
      }
      if (!replacePicture && userProfileData.picture) {
        delete dto.picture
      }
    }

    const now = new Date()
    const profileData = {
      ...dto,
      id: uid,
      createdAt: userProfileData.createdAt ?? now,
      updatedAt: now,
      picturesGallery
    }
    if (dto.address) {
      profileData.address = { ...userProfileData?.address, ...dto.address }
    }
    await namespace.createOrUpdate(this.db, '', this.profilesRef, profileData)

    return (await this.getProfile(uid)) as UserProfileDTO
  }

  async getProfile(uid: string): Promise<UserProfileDTO | null> {
    const userProfileData = await namespace.tryGet<UserProfileDTO>(this.db, '', this.profilesRef, uid)
    if (!userProfileData) {
      return null
    }

    return { ...userProfileData, uid } as UserProfileDTO
  }

  async saveWorkPreferences(uid: string, dto: SaveWorkPreferencesDTO): Promise<UserWorkPreferencesDTO> {
    const userWorkPreferencesData = await this.getWorkPreferences(uid)

    const now = new Date()
    const workPreferencesData = {
      ...dto,
      id: uid,
      createdAt: userWorkPreferencesData?.createdAt ?? now,
      updatedAt: now
    }
    await namespace.createOrUpdate(this.db, '', this.workPreferencesRef, workPreferencesData)

    return (await this.getWorkPreferences(uid)) as UserWorkPreferencesDTO
  }

  async getWorkPreferences(uid: string): Promise<UserWorkPreferencesDTO | null> {
    const workPreferencesData = await namespace.tryGet<UserWorkPreferencesDTO>(this.db, '', this.workPreferencesRef, uid)
    if (!workPreferencesData) {
      return null
    }

    return { ...workPreferencesData, uid } as UserWorkPreferencesDTO
  }

  async saveQuestionnaire(uid: string, questionnaire: []) {
    const now = new Date()
    const profileData = {
      id: uid,
      questionnaire,
      updatedAt: now
    }
    await namespace.update(this.db, '', this.profilesRef, profileData)

    return this.getProfile(uid)
  }
}
