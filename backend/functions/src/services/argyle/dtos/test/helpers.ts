import Faker from 'faker'
import { ArgyleUserItemsResponse } from '../../protocols/i-argyle.service'

export const mockArgyleUserItemsResponse = <T>(mockType: () => T): ArgyleUserItemsResponse<T> => ({
  count: Faker.random.number(),
  results: [mockType(), mockType(), mockType(), mockType()]
})