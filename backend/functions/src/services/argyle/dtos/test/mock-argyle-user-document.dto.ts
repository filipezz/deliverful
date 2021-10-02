import Faker from 'faker'
import { ArgyleUserDocumentType, RawArgyleUserDocumentDTO } from 'deliverful-types/argyle/dtos'
import { argyleUserDocumentTypes } from '../../constants/argyle-user-document-types'

export const mockArgyleUserDocumentType = (): ArgyleUserDocumentType => (
  Faker.random.objectElement<ArgyleUserDocumentType>(argyleUserDocumentTypes)
)

export const mockRawArgyleUserDocumentDTO = (): RawArgyleUserDocumentDTO => ({
  id: Faker.random.uuid(),
  account: Faker.random.uuid(),
  employer: Faker.company.companyName(),
  document_number: Faker.random.alphaNumeric(11),
  document_type: Faker.random.objectElement<ArgyleUserDocumentType>(argyleUserDocumentTypes),
  document_type_description: Faker.random.words(),
  expiration_date: Faker.date.recent(),
  created_at: Faker.date.past(),
  updated_at: Faker.date.recent(),
  file_url: Faker.image.image()
})