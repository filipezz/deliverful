import {
  SaveUserProfileDTO,
  UserProfileDTO,
  SaveWorkPreferencesDTO,
  UserWorkPreferencesDTO
} from 'deliverful-types/profiles/dtos'

export interface IProfilesRepository {
  saveProfile(uid: string, dto: SaveUserProfileDTO, replacePicture?: boolean): Promise<UserProfileDTO>
  getProfile(uid: string): Promise<UserProfileDTO | null>
  saveWorkPreferences(uid: string, dto: SaveWorkPreferencesDTO): Promise<UserWorkPreferencesDTO>
  getWorkPreferences(uid: string): Promise<UserWorkPreferencesDTO | null>
  saveQuestionnaire(uid: string, questionnaire: []): Promise<any>
}
