import { ArgyleUserDocumentDTO, ArgyleUserDocumentType } from 'deliverful-types/argyle/dtos'
import { getFirestore, tearDown } from '../../test/firebase-helpers'
import { ArgyleService } from './argyle.service'
import { mockArgyleUserItemsResponse } from './dtos/test/helpers'
import { mockArgyleUserDocumentType, mockRawArgyleUserDocumentDTO } from './dtos/test/mock-argyle-user-document.dto'
import { mockLoadUserItemDTO } from './dtos/test/mock-load-user-item.dto'
import { LoadUserItemDTO } from './protocols/i-argyle.service'

type ISutTypes = {
  service: ArgyleService
}

function makeSut(): ISutTypes {
  const service = ArgyleService.getInstance(getFirestore())

  return { service }
}

describe('Argyle Service', () => {
  let sut: ISutTypes

  beforeEach(() => {
    sut = makeSut()
  })

  afterEach(async () => {
    await tearDown()
  })

  describe('loadUserDocumentForType()', () => {
    let dto: LoadUserItemDTO
    let type: ArgyleUserDocumentType

    beforeEach(() => {
      dto = mockLoadUserItemDTO()
      type = mockArgyleUserDocumentType()
    })

    describe('_listDocuments()', () => {
      let _listDocumentsSpy: jest.SpyInstance

      beforeEach(() => {
        _listDocumentsSpy = jest.spyOn(sut.service, '_listDocuments')
          .mockResolvedValueOnce(mockArgyleUserItemsResponse(mockRawArgyleUserDocumentDTO))
      })

      it('should call _listDocuments() with correct params', async () => {
        await sut.service.loadUserDocumentForType(dto, type)

        expect(_listDocumentsSpy).toHaveBeenCalledTimes(1)
        expect(_listDocumentsSpy).toHaveBeenCalledWith({
          user: dto.userId,
          account: dto.accountId
        })
      })

      it('should return null if _listDocuments() returns empty', async () => {
        const result = await sut.service.loadUserDocumentForType(dto, 'unknown_type' as ArgyleUserDocumentType)

        expect(result).toBeNull()
      })
    })

    it('should return ArgyleDocumentDTO with correct "type", on success', async () => {
      const mockedArgyleUserItemsResponse = mockArgyleUserItemsResponse(mockRawArgyleUserDocumentDTO)
      jest.spyOn(sut.service, '_listDocuments').mockResolvedValueOnce(mockedArgyleUserItemsResponse)
      const randomRawArgyleUserDocumentDTO = mockedArgyleUserItemsResponse.results[0]

      const result = await sut.service.loadUserDocumentForType(dto, randomRawArgyleUserDocumentDTO.document_type)

      const expectedResult: ArgyleUserDocumentDTO = {
        id: randomRawArgyleUserDocumentDTO.id,
        account: randomRawArgyleUserDocumentDTO.account,
        employer: randomRawArgyleUserDocumentDTO.employer,
        expirationDate: randomRawArgyleUserDocumentDTO.expiration_date,
        issuedDate: randomRawArgyleUserDocumentDTO.created_at,
        number: randomRawArgyleUserDocumentDTO.document_number,
        type: randomRawArgyleUserDocumentDTO.document_type,
        typeDescription: randomRawArgyleUserDocumentDTO.document_type_description,
        fileUrl: randomRawArgyleUserDocumentDTO.file_url
      }
      expect(result).toEqual(expectedResult)
    })
  })
})