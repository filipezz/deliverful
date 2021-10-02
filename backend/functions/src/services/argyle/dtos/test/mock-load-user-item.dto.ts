import Faker from 'faker'
import { LoadUserItemDTO } from '../../protocols/i-argyle.service'

export const mockLoadUserItemDTO = (): LoadUserItemDTO => ({
  accountId: Faker.random.uuid(),
  userId: Faker.random.uuid()
})